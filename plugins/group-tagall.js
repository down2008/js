const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "tagall",
    react: "🔊",
    alias: ["gc_tagall"],
    desc: "Tag all group members (Admins & Owner only)",
    category: "group",
    use: '.tagall [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, isAdmins, isCreator, command, body }) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins && !isCreator) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴏʀ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

        const groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ɢʀᴏᴜᴘ ɪɴғᴏ.");

        const groupName = groupInfo.subject || "Unknown Group";
        const totalMembers = participants?.length || 0;
        if (totalMembers === 0) return reply("❌ ɴᴏ ᴍᴇᴍʙᴇʀs ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ.");

        // Extract message or default
        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "📢 ᴀᴛᴛᴇɴᴛɪᴏɴ ᴇᴠᴇʀʏᴏɴᴇ!";

        // Format text in your style
        let teks = `⟣──────────────────⟢
┋ *ɢʀᴏᴜᴘ* : ${groupName}
┋ *ᴍᴇᴍʙᴇʀs* : ${totalMembers}
┋ *ᴍᴇssᴀɢᴇ* : ${message}
⟣──────────────────⟢
┋ *ᴍᴇɴᴛɪᴏɴs* :`;

        for (let mem of participants) {
            teks += `\n┋ • @${mem.id.split('@')[0]}`;
        }

        teks += `\n⟣──────────────────⟢
┋ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ* 
⟣──────────────────⟢`;

        // Send message with mentions
        await conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek });

    } catch (e) {
        console.error("ᴛᴀɢᴀʟʟ ᴇʀʀᴏʀ:", e);
        reply(`❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ.\n\n${e.message || e}`);
    }
});
