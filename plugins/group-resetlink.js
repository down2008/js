const { cmd } = require('../command');

cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink", "resetglink", "revokelink", "f_revoke"],
    desc: "Reset the group link and send the new one",
    category: "group",
    use: '.revoke',
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply(`❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.`);
        if (!isAdmins) return reply(`⛔ ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀ *ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ* ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.`);
        if (!isBotAdmins) return reply(`❌ I ɴᴇᴇᴅ ᴛᴏ ʙᴇ *ᴀᴅᴍɪɴ* ᴛᴏ ʀᴇsᴇᴛ ᴛʜᴇ ɢʀᴏᴜᴘ ʟɪɴᴋ.`);

        // Réinitialisation du lien
        await conn.groupRevokeInvite({ groupId: from });

        // Récupération du nouveau code d'invitation
        const inviteCode = await conn.groupInviteCode(from);
        const newLink = `https://chat.whatsapp.com/${inviteCode}`;

        // Envoi du message avec le nouveau lien
        await conn.sendMessage(from, {
            text: `✅ *ɢʀᴏᴜᴘ ʟɪɴᴋ ʜᴀs ʙᴇᴇɴ ʀᴇsᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ!*\n\n🌐 New group link:\n${newLink}`
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply(`❌ Error resetting group link.\n\n${err.message}`);
    }
});
