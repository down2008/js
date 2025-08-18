const config = require('../config');
const { cmd } = require('../command');
const { getRandom } = require('../lib/functions');

cmd({
    pattern: "tagall",
    react: "🔊",
    alias: ["gc_tagall"],
    desc: "Tag all group members (Admins & Owner only)",
    category: "group",
    use: '.tagall [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, isAdmins, isCreator, prefix, command, args, body }) => {
    try {
        // 🔹 Group-only check
        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
        }

        // 🔹 Permission check (Admin OR Bot Owner)
        if (!isAdmins && !isCreator) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴏʀ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        // 🔹 Get group info
        const groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ɢʀᴏᴜᴘ ɪɴғᴏʀᴍᴀᴛɪᴏɴ.");

        const groupName = groupInfo.subject || "Unknown Group";
        const totalMembers = participants?.length || 0;
        if (totalMembers === 0) return reply("❌ ɴᴏ ᴍᴇᴍʙᴇʀs ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ.");

        // 🔹 Random emoji
        const emojis = ['📢', '🔊', '🌐', '🔰', '❤‍🩹', '🤍', '🖤', '🩵', '📝', '💗', '🔖', '🪩', '📦', '🎉', '🛡️', '💸', '⏳', '🗿', '🚀', '🎧', '🪀', '⚡', '🚩', '🍁', '🗣️', '👻', '⚠️', '🔥'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // 🔹 Extract message or set default
        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "📢 ᴀᴛᴛᴇɴᴛɪᴏɴ ᴇᴠᴇʀʏᴏɴᴇ!";

        let teks = `▢ ɢʀᴏᴜᴘ : *${groupName}*\n▢ ᴍᴇᴍʙᴇʀs : *${totalMembers}*\n▢ ᴍᴇssᴀɢᴇ: *${message}*\n\n┌───⊷ *ᴍᴇɴᴛɪᴏɴs*\n`;

        for (let mem of participants) {
            teks += `*│•* ${randomEmoji} @${mem.id.split('@')[0]}\n`;
        }
        teks += "└──ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ──";

        // 🔹 Send message with mentions
        conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek });

    } catch (e) {
        console.error("TagAll Error:", e);
        reply(`❌ An error occurred.\n\n${e.message || e}`);
    }
});
