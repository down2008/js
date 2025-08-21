const { cmd } = require('../command');

cmd({
    pattern: "out",
    alias: ["ck", "🦶", "kik"],
    desc: "Removes all members with specific country code from the group",
    category: "group",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, groupMetadata, isCreator
}) => {
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

    // Permission check
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "📛 ᴛʜɪs ɪs ᴀɴ *ᴏᴡɴᴇʀ-ᴏɴʟʏ*."
        }, { quoted: mek });
    }

    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    if (!q) return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ. ᴇxᴀᴍᴘʟᴇ: .out 92");

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        return reply("❌ ɪɴᴠᴀʟɪᴅ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ. ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴏɴʟʏ ᴅɪɢɪᴛs (e.g., 509 ғᴏʀ +509 ɴᴜᴍʙᴇʀs)");
    }

    try {
        const participants = groupMetadata.participants;

        // Vérifier la partie avant le @
        const targets = participants.filter(p =>
            p.id.split("@")[0].startsWith(countryCode) && !p.admin
        );

        if (targets.length === 0) {
            return reply(`❌ No members found with country code +${countryCode}`);
        }

        const jids = targets.map(p => p.id);

        // Pour éviter les limites de WhatsApp → suppression en petits lots
        const chunkSize = 5;
        for (let i = 0; i < jids.length; i += chunkSize) {
            const chunk = jids.slice(i, i + chunkSize);
            await conn.groupParticipantsUpdate(from, chunk, "remove");
        }

        reply(`✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ${jids.length} ᴍᴇᴍʙᴇʀs ᴡɪᴛʜ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ +${countryCode}`);
    } catch (error) {
        console.error("Out command error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});
