const { cmd } = require('../command');

cmd({
    pattern: "unmute",
    alias: ["groupunmute"],
    react: "🔊",
    desc: "Unmute the group (Everyone can send messages).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, reply, isGroup }) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

        // Fetch group metadata to check admins
        const metadata = await conn.groupMetadata(from);
        const groupAdmins = metadata.participants
            .filter(p => p.admin !== null)
            .map(p => p.id);

        const botJid = conn.user.id;
        if (!groupAdmins.includes(botJid)) 
            return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜɴᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ.");

        const senderId = m.sender;
        if (!groupAdmins.includes(senderId)) 
            return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

        // Unlock the group for everyone
        await conn.groupSettingUpdate(from, "not_announcement");
        reply("✅ ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴜɴᴍᴜᴛᴇᴅ. ᴇᴠᴇʀʏᴏɴᴇ ᴄᴀɴ ɴᴏᴡ sᴇɴᴅ ᴍᴇssᴀɢᴇs.");

    } catch (e) {
        console.error("Error unmuting group:", e);
        reply("❌ Failed to unmute the group. Please try again.");
    }
});
