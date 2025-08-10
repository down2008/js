const { cmd } = require('../command');
const fetch = require('node-fetch');
const ytsearch = require('yt-search');

const pendingChoices = new Map(); // userId -> { downloadUrl, title, from }

cmd({
    pattern: "play",
    alias: ["mp3"],
    react: '🎶',
    desc: "Download a YouTube song",
    category: "download",
    use: ".mp3 <YouTube URL or Song Name>",
    filename: __filename
}, async (conn, m, store, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) return reply("*🎵 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ ᴏʀ sᴏɴɢ ɴᴀᴍᴇ.*");

        const searchResult = await ytsearch(q);
        if (!searchResult.videos || searchResult.videos.length === 0)
            return reply("❌ No results found!");

        const video = searchResult.videos[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(video.url)}`;

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl)
            return reply("⚠️ ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴛʜᴇ ᴀᴜᴅɪᴏ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.");

        const songInfo = `
╭── 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』
│ ⿻ *Title:* ${video.title}
│ ⿻ *Duration:* ${video.timestamp}
│ ⿻ *Views:* ${video.views}
│ ⿻ *Author:* ${video.author.name}
│ ⿻ *Link:* ${video.url}
╰─────────────⭑─
> *ʀᴇᴘʟʏ ᴡɪᴛʜ* \`ᴀᴜᴅɪᴏ\` *ᴏʀ* \`ᴅᴏᴄᴜᴍᴇɴᴛ\` *ᴛᴏ ᴄʜᴏᴏsᴇ ᴛʜᴇ ғᴏʀᴍᴀᴛ.*
        `;

        await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: songInfo
        }, { quoted: m });

        // Enregistre ce choix sans timeout (illimité)
        pendingChoices.set(m.sender, {
            downloadUrl: data.result.downloadUrl,
            title: data.result.title,
            from
        });

    } catch (err) {
        console.error(err);
        reply("❌ An error occurred. Please try again later.");
    }
});

// Listener global, à placer dans ton fichier principal
conn.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message?.conversation) return;

    const userId = msg.key.participant || msg.key.remoteJid;
    const text = msg.message.conversation.toLowerCase().trim();

    if (!pendingChoices.has(userId)) return;

    const choiceData = pendingChoices.get(userId);

    if (text === "audio") {
        await conn.sendMessage(choiceData.from, {
            audio: { url: choiceData.downloadUrl },
            mimetype: "audio/mpeg"
        }, { quoted: msg });
        pendingChoices.delete(userId);  // Supprime après choix
    } else if (text === "document") {
        await conn.sendMessage(choiceData.from, {
            document: { url: choiceData.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${choiceData.title}.mp3`,
            caption: "> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*"
        }, { quoted: msg });
        pendingChoices.delete(userId);  // Supprime après choix
    }
});
