const { cmd } = require('../command');

cmd({
    pattern: "unlockgc",
    alias: ["unlock"],
    react: "🔓",
    desc: "Unlock the group (Allows new members to join).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜɴʟᴏᴄᴋ ᴛʜᴇ ɢʀᴏᴜᴘ.");

        await conn.groupSettingUpdate(from, "unlocked");

        const text = `⟣──────────────────⟢
┋ 🔓 ᴛʜᴇ ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ *ᴜɴʟᴏᴄᴋᴇᴅ*. ɴᴇᴡ ᴍᴇᴍʙᴇʀs ᴄᴀɴ ɴᴏᴡ ᴊᴏɪɴ.
⟣──────────────────⟢`;

        await conn.sendMessage(from, { text }, { quoted: mek });

    } catch (e) {
        console.error("UnlockGC Error:", e);
        reply("❌ Failed to unlock the group. Please try again.");
    }
});
