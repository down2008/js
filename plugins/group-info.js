const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions2'); // Assure-toi que getBuffer fonctionne correctement

cmd({
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo"],
    desc: "Get group information.",
    category: "group",
    use: '.ginfo',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, isAdmins, isOwner }) => {
    try {
        if (!isGroup) 
            return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins && !isOwner) 
            return reply("⛔ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴏʀ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs.");

        // Fetch group metadata
        const metadata = await conn.groupMetadata(from);
        const groupAdmins = participants.filter(p => p.admin || p.id === metadata.owner);
        const owner = metadata.owner || groupAdmins[0]?.id || "unknown";

        // Profile picture with fallback
        let ppUrl;
        try { 
            ppUrl = await conn.profilePictureUrl(from, 'image'); 
        } catch { 
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; 
        }

        const buffer = await getBuffer(ppUrl);

        // Admin list
        const listAdmin = groupAdmins.map(v => `┋ • @${v.id.split('@')[0]}`).join('\n');

        // Styled group info
        const gdata = `⟣──────────────────⟢
┋ *ɢʀᴏᴜᴘ ɴᴀᴍᴇ* : ${metadata.subject}
┋ *ɢʀᴏᴜᴘ ɪᴅ* : ${metadata.id}
┋ *ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛs* : ${metadata.size}
┋ *ɢʀᴏᴜᴘ ᴄʀᴇᴀᴛᴏʀ* : @${owner.split('@')[0]}
┋ *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ* : ${metadata.desc?.toString() || 'No description'}
⟣──────────────────⟢
┋ *ᴀᴅᴍɪɴs (${groupAdmins.length})*:
${listAdmin}
⟣──────────────────⟢
┋ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*
⟣──────────────────⟢`;

        // Send message with mentions
        await conn.sendMessage(from, {
            image: buffer,
            caption: gdata,
            mentions: groupAdmins.map(v => v.id).concat([owner])
        });

    } catch (e) {
        console.error("Ginfo Error:", e);
        reply(`❌ An error occurred:\n\n${e?.message || e}`);
    }
});
