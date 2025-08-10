const { cmd } = require('../command');
const fetch = require('node-fetch');
const ytsearch = require('yt-search');

// Stocke l'état des attentes par utilisateur et par chat
const awaitingResponse = new Map();

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
        if (!q) return reply("*🎵 Please provide a YouTube URL or song name.*");

        const searchResult = await ytsearch(q);
        if (!searchResult.videos || searchResult.videos.length === 0)
            return reply("❌ No results found!");

        const video = searchResult.videos[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(video.url)}`;

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl)
            return reply("⚠️ Failed to fetch the audio. Please try again later.");

        const songInfo = `
╭── 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』
│ ⿻ *Title:* ${video.title}
│ ⿻ *Duration:* ${video.timestamp}
│ ⿻ *Views:* ${video.views}
│ ⿻ *Author:* ${video.author.name}
│ ⿻ *Link:* ${video.url}
╰─────────────⭑─
> *Reply to this message with* \`audio\` *or* \`document\` *to choose the format.*
        `;

        // Envoie le message avec demande de reply
        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: songInfo
        }, { quoted: m });

        // Stocke l'état d'attente (avec les infos du téléchargement)
        awaitingResponse.set(m.sender, {
            chat: from,
            stanzaId: sentMsg.key.id,
            downloadUrl: data.result.downloadUrl,
            title: data.result.title
        });

    } catch (err) {
        console.error(err);
        reply("❌ An error occurred. Please try again later.");
    }
});

// Gestionnaire global pour les réponses utilisateurs
conn.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages || messages.length === 0) return;
    const msg = messages[0];
    if (!msg.message) return;

    const fromUser = msg.key.participant || msg.key.remoteJid;
    if (!awaitingResponse.has(fromUser)) return;

    const state = awaitingResponse.get(fromUser);

    // Vérifie que c'est une réponse au bon message
    const stanzaId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
    if (stanzaId !== state.stanzaId) return;

    // Récupère le texte de la réponse
    let text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    text = text.toLowerCase().trim();

    if (text === "audio") {
        await conn.sendMessage(state.chat, {
            audio: { url: state.downloadUrl },
            mimetype: "audio/mpeg"
        }, { quoted: msg });
    } else if (text === "document") {
        await conn.sendMessage(state.chat, {
            document: { url: state.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${state.title}.mp3`,
            caption: "> *© Powered by Dyby Tech*"
        }, { quoted: msg });
    } else {
        await conn.sendMessage(state.chat, {
            text: "❎ Invalid choice. Please reply with *audio* or *document* only.",
        }, { quoted: msg });
        return; // Ne pas clear l’état si choix invalide
    }

    // Laisse l'état pour permettre plusieurs envois (illimité)
});
