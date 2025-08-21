const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer } = require('../lib/functions2'); // Assure-toi que cette fonction récupère bien les buffers via axios
const path = require('path');

cmd({
    pattern: "linkgroup",
    alias: ["link", "invite", "grouplink", "satan-link"],
    desc: "Get group invite link.",
    category: "group",
    react: "🙋🏻‍♂️",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, args, q, isGroup, sender, reply }) => {
    try {
        if (!isGroup) return reply("> ❌ ᴛʜɪs ғᴇᴀᴛᴜʀᴇ ɪs ᴏɴʟʏ ᴀᴠᴀɪʟᴀʙʟᴇ ɪɴ ɢʀᴏᴜᴘs.");

        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];

        const groupMetadata = await conn.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(member => member.admin);
        const isBotAdmins = groupAdmins.some(admin => admin.id === botNumber + '@s.whatsapp.net');
        const isAdmins = groupAdmins.some(admin => admin.id === sender);

        if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ғᴇᴛᴄʜ ᴛʜᴇ ɢʀᴏᴜᴘ ʟɪɴᴋ.");
        if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴏʀ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) return reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴛʀɪᴇᴠᴇ ᴛʜᴇ ɪɴᴠɪᴛᴇ ᴄᴏᴅᴇ.");

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        const ownerJid = groupMetadata.owner || '';
        const groupOwner = ownerJid ? '@' + ownerJid.split('@')[0] : 'Unknown';
        const groupName = groupMetadata.subject || 'Unknown';
        const groupId = groupMetadata.id || from;
        const memberCount = groupMetadata.participants.length;

        const infoText = `⟣──────────────────⟢
┋ *ɢʀᴏᴜᴘ ɴᴀᴍᴇ* : ${groupName}
┋ *ᴏᴡɴᴇʀ* : ${groupOwner}
┋ *ᴍᴇᴍʙᴇʀs* : ${memberCount}
┋ *ɢ ʟɪɴᴋ* : ${inviteLink}
⟣──────────────────⟢
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg'; // Fallback photo
        }

        const buffer = await getBuffer(ppUrl);

        return conn.sendMessage(from, {
            image: buffer,
            caption: infoText,
            mentions: [ownerJid]
        }, { quoted: m });

    } catch (error) {
        console.error("❌ Error in linkgroup command:", error);
        reply(`⚠️ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ: ${error.message || "Unknown error"}`);
    }
});
