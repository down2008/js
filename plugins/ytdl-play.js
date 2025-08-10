const { cmd } = require('../command');
const fetch = require('node-fetch');
const ytsearch = require('yt-search');

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

        const songInfo = `
╭── 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』
│ ⿻ *Title:* ${video.title}
│ ⿻ *Duration:* ${video.timestamp}
│ ⿻ *Views:* ${video.views}
│ ⿻ *Author:* ${video.author.name}
│ ⿻ *Link:* ${video.url}
╰─────────────⭑─
> *ʀᴇᴘʟʏ ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴡɪᴛʜ* \`audio\` *ᴏʀ* \`document\` *ᴛᴏ ᴄʜᴏᴏsᴇ ᴛʜᴇ ғᴏʀᴍᴀᴛ.*
        `;

        // Envoie du message avec demande de reply
        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: songInfo
        }, { quoted: m });

        // Handler pour la réponse utilisateur
        const handler = async (update) => {
            const msg = update.messages?.[0];
            if (!msg || !msg.message) return;

            const fromUser = msg.key.participant || msg.key.remoteJid;
            if (fromUser !== m.sender) return;  // Seulement la personne qui a lancé la commande

            // Vérifie si c'est une reply au message du bot (stanzaId = id du message du bot)
            const stanzaId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
            if (stanzaId !== sentMsg.key.id) return;

            // Texte de la réponse (conversation ou extendedTextMessage)
            let text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            text = text.toLowerCase().trim();

            if (text === "audio") {
                await conn.sendMessage(from, {
                    audio: { url: data.result.downloadUrl },
                    mimetype: "audio/mpeg"
                }, { quoted: msg });
            } else if (text === "document") {
                await conn.sendMessage(from, {
                    document: { url: data.result.downloadUrl },
                    mimetype: "audio/mpeg",
                    fileName: `${data.result.title}.mp3`,
                    caption: "> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*"
                }, { quoted: msg });
            } else {
                await conn.sendMessage(from, {
                    text: "❎ ɪɴᴠᴀʟɪᴅ ᴄʜᴏɪᴄᴇ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ *ᴀᴜᴅɪᴏ* or *ᴅᴏᴄᴜᴍᴇɴᴛ* ᴏɴʟʏ.",
                }, { quoted: msg });
            }
        };

        // On ajoute l'écouteur (il reste actif tant que le bot tourne)
        conn.ev.on("messages.upsert", handler);

        // IMPORTANT : si tu veux limiter la durée, tu peux gérer un clearTimeout ici
        // Mais pour illimité, ne rien mettre (attention à la mémoire)

    } catch (err) {
        console.error(err);
        reply("❌ An error occurred. Please try again later.");
    }
});        }, 5 * 60 * 1000);

    } catch (err) {
        console.error(err);
        reply("❌ An error occurred. Please try again later.");
    }
});
