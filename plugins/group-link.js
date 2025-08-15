const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions2');
const config = require('../config');

cmd({
    pattern: "linkgroup",
    alias: ["link", "invite", "grouplink", "satan-link"],
    desc: "Get group invite link.",
    category: "group",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    try {
        // Vérifie si c'est un groupe
        if (!isGroup) return reply("🚫 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs.");

        // Récupère infos du bot et de l'expéditeur
        const botNumber = (conn.user.id.includes('@') ? conn.user.id.split('@')[0] : conn.user.id.split(':')[0]);
        const senderNumber = sender.split('@')[0];

        // Récupère infos du groupe
        const metadata = await conn.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin !== null);
        const isBotAdmin = admins.some(a => a.id.split('@')[0] === botNumber);
        const isAdmin = admins.some(a => a.id === sender);

        // Permission
        if (!isBotAdmin) return reply("❌ I ᴍᴜsᴛ ʙᴇ ᴀᴅᴍɪɴ ᴛᴏ ɢᴇᴛ ᴛʜᴇ ɢʀᴏᴜᴘ ʟɪɴᴋ.");
        if (!isAdmin) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

        // Invite link
        const inviteCode = await conn.groupInviteCode(from);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        // Données du groupe
        const ownerJid = metadata.owner || '';
        const groupOwner = ownerJid ? '@' + ownerJid.split('@')[0] : 'Unknown';
        const groupName = metadata.subject || 'Unknown';
        const memberCount = metadata.participants.length;

        // Texte final
        const caption = `
╭───「  *𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐍𝐊* 」
│ 👥 ᴍᴇᴍʙᴇʀs: *${memberCount}*
│ 👑 ᴏᴡɴᴇʀ: ${groupOwner}
│ 🏷️ ɴᴀᴍᴇ: ${groupName}
│ 🔗 Link: ${inviteLink}
╰───────────────◆
> _ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ @${senderNumber}_`;

        // Image du groupe
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
        }

        const buffer = await getBuffer(ppUrl);

        // Envoi du message
        return conn.sendMessage(from, {
            image: buffer,
            caption,
            mentions: [ownerJid, sender]
        }, { quoted: m });

    } catch (e) {
        console.error("Error in linkgroup:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
