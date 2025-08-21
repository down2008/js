const { cmd } = require('../command');

cmd({
    pattern: "mute",
    alias: ["groupmute"],
    react: "🔇",
    desc: "Mute the group (Only admins can send messages).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴍᴜᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ.");

        await conn.groupSettingUpdate(from, "announcement");

        const text = `⟣──────────────────⟢
┋ 🔇 ᴛʜᴇ ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ *ᴍᴜᴛᴇᴅ*. ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs.
⟣──────────────────⟢`;

        await conn.sendMessage(from, { text }, { quoted: mek });

    } catch (e) {
        console.error("Mute Command Error:", e);
        reply("❌ Failed to mute the group. Please try again.");
    }
});
