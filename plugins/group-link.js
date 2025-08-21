const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions2');

cmd({
    pattern: "linkgroup",
    alias: ["link", "invite", "grouplink", "satan-link"],
    desc: "Get group invite link.",
    category: "group",
    react: "🙋🏻‍♂️",
    filename: __filename,
},
async (conn, mek, m, { from, quoted, reply, sender }) => {
    try {
        const groupMetadata = await conn.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(u => u.admin);
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupAdmins.some(a => a.id === botNumber);
        const isUserAdmin = groupAdmins.some(a => a.id === sender) || sender === conn.user.id;

        if (!isBotAdmin) return reply("❌ I ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ғᴇᴛᴄʜ ᴛʜᴇ ɢʀᴏᴜᴘ ʟɪɴᴋ.");
        if (!isUserAdmin) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs command.");

        const inviteCode = await conn.groupInviteCode(from);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        const groupOwner = groupMetadata.owner ? '@' + groupMetadata.owner.split('@')[0] : "Unknown";

        const infoText = `⟣──────────────────⟢
┋ *ɢʀᴏᴜᴘ ɴᴀᴍᴇ* : ${groupMetadata.subject}
┋ *ᴏᴡɴᴇʀ* : ${groupOwner}
┋ *ᴍᴇᴍʙᴇʀs* : ${groupMetadata.participants.length}
┋ *ɢ ʟɪɴᴋ* : ${inviteLink}
⟣──────────────────⟢
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        let ppUrl;
        try { ppUrl = await conn.profilePictureUrl(from, 'image'); } 
        catch { ppUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg'; }

        const buffer = await getBuffer(ppUrl);

        await conn.sendMessage(from, { image: buffer, caption: infoText, mentions: [groupMetadata.owner] });

    } catch (e) {
        console.error("LinkGroup Error:", e);
        reply(`❌ An error occurred.\n\n${e?.message || e}`);
    }
});
