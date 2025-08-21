const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "kickall",
    alias: ["byeall", "end", "endgc"],
    desc: "Remove all members (including admins) except a specified number",
    category: "group",
    react: "⚠️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, reply, groupMetadata, isCreator }) => {
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isCreator) return reply("❌ ᴏɴʟʏ ᴛʜᴇ ɢʀᴏᴜᴘ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴀᴅᴍɪɴ ʀɪɢʜᴛs ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    try {
        const ignoreJid = "50948702213@s.whatsapp.net"; // JID à exclure
        const participants = groupMetadata.participants;

        // Filter all except the excluded number
        const targets = participants.filter(p => p.id !== ignoreJid && p.id !== conn.user.id);
        const jids = targets.map(p => p.id);

        if (jids.length === 0) return reply("✅ ɴᴏ ᴍᴇᴍʙᴇʀs ᴛᴏ ʀᴇᴍᴏᴠᴇ (ᴇᴠᴇʀʏᴏɴᴇ ɪs ᴇxᴄʟᴜᴅᴇᴅ).");

        const chunkSize = 5; // éviter les erreurs sur les gros groupes
        for (let i = 0; i < jids.length; i += chunkSize) {
            const chunk = jids.slice(i, i + chunkSize);
            await conn.groupParticipantsUpdate(from, chunk, "remove");
        }

        reply(`✅ ʀᴇᴍᴏᴠᴇᴅ ${jids.length} ᴍᴇᴍʙᴇʀs ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ.`);
    } catch (error) {
        console.error("KickAll error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});


cmd({
    pattern: "kickall2",
    alias: ["kickall4", "kickrush"],
    desc: "Remove all non-admin members instantly",
    react: "⚡",
    category: "group",
    filename: __filename,
},
async (conn, mek, m, { from, isGroup, groupMetadata, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("📛 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs");

        const botOwner = conn.user.id.split(":")[0];
        const senderNumber = m.sender.split("@")[0];
        if (senderNumber !== botOwner) return reply("⛔ ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs");
        if (!isBotAdmins) return reply("🤖 ɪ ɴᴇᴇᴅ ᴀᴅᴍɪɴ ʀɪɢʜᴛs ᴛᴏ ᴘʀᴏᴄᴇᴇᴅ");

        const allParticipants = groupMetadata.participants;
        const botJid = conn.user.id;

        const groupAdmins = allParticipants.filter(p => p.admin).map(p => p.id);
        const nonAdmins = allParticipants.filter(p => !groupAdmins.includes(p.id) && p.id !== botJid);

        if (nonAdmins.length === 0) return reply("ℹ️ ɴᴏ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ᴛᴏ ʀᴇᴍᴏᴠᴇ");

        const chunkSize = 5;
        for (let i = 0; i < nonAdmins.length; i += chunkSize) {
            const chunk = nonAdmins.slice(i, i + chunkSize).map(p => p.id);
            await conn.groupParticipantsUpdate(from, chunk, "remove");
        }

        reply(`✅ ʀᴇᴍᴏᴠᴇᴅ ${nonAdmins.length} ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ғʀᴏᴍ ɢʀᴏᴜᴘ '${groupMetadata.subject}' ɪɴsᴛᴀɴᴛʟʏ`);
    } catch (err) {
        console.error("KickAll2 error:", err);
        reply("⚠️ Error while kicking members");
    }
});
