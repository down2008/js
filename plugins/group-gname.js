const { cmd } = require('../command');

cmd({
    pattern: "updategname",
    alias: ["upgname", "gname"],
    react: "📝",
    desc: "Change the group name.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ use ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        if (!isBotAdmins) return reply("❌ I ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ ɴᴀᴍᴇ.");
        if (!q) return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴇᴡ ɢʀᴏᴜᴘ ɴᴀᴍᴇ.");

        await conn.groupUpdateSubject(from, q);

        const text = `⟣──────────────────⟢
┋ *ɢʀᴏᴜᴘ ɴᴀᴍᴇ* ʜᴀs ʙᴇᴇɴ ᴜᴘᴅᴀᴛᴇᴅ ᴛᴏ:
┋ *${q}*
⟣──────────────────⟢
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*
⟣──────────────────⟢`;

        await conn.sendMessage(from, { text }, { quoted: mek });

    } catch (e) {
        console.error("UpdateGname Error:", e);
        reply("❌ Failed to update the group name. Please try again.");
    }
});
