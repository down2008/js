const { cmd } = require('../command');
const fetch = require('node-fetch');
const ytsearch = require('yt-search');

cmd({
    pattern: "play",
    alias: ["mp3"],
    react: '🎶',
    desc: "Download a YouTube song",
    category: "main",
    use: ".mp3 <YouTube URL or Song Name>",
    filename: __filename
}, async (conn, m, store, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) {
            return reply("*🎵 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ ᴏʀ sᴏɴɢ ɴᴀᴍᴇ.*");
        }

        // Search YouTube
        const searchResult = await ytsearch(q);
        if (!searchResult.results || searchResult.results.length === 0) {
            return reply("❌ No results found!");
        }

        const video = searchResult.results[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(video.url)}`;

        // Fetch MP3 download info
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("⚠️ Failed to fetch the audio. Please try again later.");
        }

        // Song Info Message
        const songInfo = `
╭── 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』
│ ⿻ *Title:* ${video.title}
│ ⿻ *Duration:* ${video.timestamp}
│ ⿻ *Views:* ${video.views}
│ ⿻ *Author:* ${video.author.name}
│ ⿻ *Link:* ${video.url}
╰─────────────⭑─
> *ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴍᴜsɪᴄ 🎶*
        `;

        // Send Thumbnail & Info
        await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: songInfo
        }, { quoted: m });

        // Send Audio
        await conn.sendMessage(from, {
            audio: { url: data.result.downloadUrl },
            mimetype: "audio/mpeg"
        }, { quoted: m });

        // Send as Document
        await conn.sendMessage(from, {
            document: { url: data.result.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${data.result.title}.mp3`,
            caption: "> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*"
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        reply("❌ An error occurred. Please try again later.");
    }
});
