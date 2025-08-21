const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Removes a member from the group (admin only).",
    category: "group",
    react: "❌",
    filename: __filename,
    use: "<reply|mention|number>"
}, async (conn, mek, m, { from, args, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ to ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴍᴇᴍʙᴇʀs.");

        const targetJid = m.mentionedJid?.[0] 
                        || m.quoted?.sender 
                        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!targetJid) {
            return reply("❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ, ᴍᴇɴᴛɪᴏɴ ᴀ ᴜsᴇʀ, ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ.");
        }

        await conn.groupParticipantsUpdate(from, [targetJid], "remove");

        const text = `⟣──────────────────⟢
┋ ✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ @${targetJid.split('@')[0]} ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ
⟣──────────────────⟢`;

        await conn.sendMessage(from, { text, mentions: [targetJid] }, { quoted: mek });

    } catch (error) {
        console.error("Kick Command Error:", error);
        reply("❌ Failed to remove the member. Ensure I have the necessary permissions.");
    }
});
