const { cmd } = require('../command');

cmd({
    pattern: "lockgc",
    alias: ["lock"],
    react: "🔒",
    desc: "Lock the group (Prevents new members from joining).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ.");

        await conn.groupSettingUpdate(from, "locked");

        const text = `⟣──────────────────⟢
┋ 🔒 ᴛʜᴇ ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ *ʟᴏᴄᴋᴇᴅ*. ɴᴇᴡ ᴍᴇᴍʙᴇʀs ᴄᴀɴɴᴏᴛ ᴊᴏɪɴ.
⟣──────────────────⟢`;

        await conn.sendMessage(from, { text }, { quoted: mek });

    } catch (e) {
        console.error("LockGC Error:", e);
        reply("❌ Failed to lock the group. Please try again.");
    }
});
