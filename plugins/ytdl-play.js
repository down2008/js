const { cmd } = require('../command');
const fetch = require('node-fetch');
const ytsearch = require('yt-search');

const pendingChoices = new Map(); // userId -> { downloadUrl, title, from }

function toSmallCaps(text) {
  const map = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ',
    i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ',
    q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
    y: 'ʏ', z: 'ᴢ'
  };
  return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

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
            return reply("⚠️ Failed to fetch the audio. Please try again later.");

        // Utilisation de la fonction pour styliser les mots-clés
        const styledTitle = toSmallCaps("Title:");
        const styledDuration = toSmallCaps("Duration:");
        const styledViews = toSmallCaps("Views:");
        const styledAuthor = toSmallCaps("Author:");
        const styledLink = toSmallCaps("Link:");
        const styledReply = toSmallCaps("Reply with");
        const styledAudio = "`audio`";
        const styledDocument = "`document`";
        const styledEnjoy = toSmallCaps("Enjoy your music 🎶");

        const songInfo = `
╭── 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』
│ ⿻ *${styledTitle}* ${video.title}
│ ⿻ *${styledDuration}* ${video.timestamp}
│ ⿻ *${styledViews}* ${video.views}
│ ⿻ *${styledAuthor}* ${video.author.name}
│ ⿻ *${styledLink}* ${video.url}
╰─────────────⭑─
> *${styledReply}*  ${styledAudio} *ᴏʀ* ${styledDocument} *ᴛᴏ ᴄʜᴏᴏsᴇ ᴛʜᴇ ғᴏʀᴍᴀᴛ.*
> *${styledEnjoy}*
        `;

        await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: songInfo
        }, { quoted: m });

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

conn.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    let text = "";
    if (msg.message.conversation) {
        text = msg.message.conversation;
    } else if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) {
        text = msg.message.extendedTextMessage.text;
    } else {
        return;
    }

    text = text.toLowerCase().trim();
    const userId = msg.key.participant || msg.key.remoteJid;

    if (!pendingChoices.has(userId)) return;

    const choiceData = pendingChoices.get(userId);

    if (text === "audio") {
        await conn.sendMessage(choiceData.from, {
            audio: { url: choiceData.downloadUrl },
            mimetype: "audio/mpeg"
        }, { quoted: msg });
        pendingChoices.delete(userId);
    } else if (text === "document") {
        await conn.sendMessage(choiceData.from, {
            document: { url: choiceData.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${choiceData.title}.mp3`,
            caption: "> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*"
        }, { quoted: msg });
        pendingChoices.delete(userId);
    }
});
