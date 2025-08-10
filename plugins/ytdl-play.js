const { cmd } = require('../command');
const fetch = require('node-fetch');
const ytsearch = require('yt-search');

const awaiting = new Map();

cmd({
    pattern: "play",
    alias: ["mp3"],
    react: '🎶',
    desc: "Download a YouTube song",
    category: "download",
    use: ".mp3 <YouTube URL or Song Name>",
    filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
    if (!q) return reply("*🎵 Please provide a YouTube URL or song name.*");

    try {
        const searchResult = await ytsearch(q);
        if (!searchResult.videos.length) return reply("❌ No results found!");

        const video = searchResult.videos[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(video.url)}`;

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl)
            return reply("⚠️ Failed to fetch audio. Please try again later.");

        const infoText = `
╭── 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』
│ ⿻ *Title:* ${video.title}
│ ⿻ *Duration:* ${video.timestamp}
│ ⿻ *Views:* ${video.views}
│ ⿻ *Author:* ${video.author.name}
│ ⿻ *Link:* ${video.url}
╰─────────────⭑─
Reply *with quote* to this message:
\`1\` to receive the audio
\`2\` to receive the document
        `.trim();

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: infoText
        }, { quoted: m });

        awaiting.set(m.sender, {
            chat: from,
            stanzaId: sentMsg.key.id,
            url: data.result.downloadUrl,
            title: data.result.title
        });

    } catch (e) {
        console.error(e);
        reply("❌ An error occurred. Please try again later.");
    }
});

conn.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages.length) return;
    const msg = messages[0];
    if (!msg.message) return;

    const userId = msg.key.participant || msg.key.remoteJid;

    if (!awaiting.has(userId)) return;

    const state = awaiting.get(userId);

    const stanzaId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
    if (stanzaId !== state.stanzaId) return;

    let text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    text = text.toLowerCase().trim();

    if (text === '1') {
        await conn.sendMessage(state.chat, {
            audio: { url: state.url },
            mimetype: 'audio/mpeg'
        }, { quoted: msg });

    } else if (text === '2') {
        await conn.sendMessage(state.chat, {
            document: { url: state.url },
            mimetype: 'audio/mpeg',
            fileName: `${state.title}.mp3`,
            caption: '> *© Powered by Dyby Tech*'
        }, { quoted: msg });

    } else {
        await conn.sendMessage(state.chat, {
            text: "❎ Invalid choice. Reply *with quote*:\n`1` for audio or `2` for document only.",
        }, { quoted: msg });
    }
    // Ne supprime pas l'état pour permettre réponses illimitées
});
