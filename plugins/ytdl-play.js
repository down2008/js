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
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("*🎵 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ ᴏʀ sᴏɴɢ ɴᴀᴍᴇ.*");

    const searchResult = await ytsearch(q);
    if (!searchResult.videos.length) return reply("❌ No results found!");

    const video = searchResult.videos[0];
    const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(video.url)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status !== 200 || !data.success || !data.result.downloadUrl)
      return reply("⚠️ Failed to fetch audio. Please try again later.");

    // Construction du message d’invite
    let menuText = `
╭── 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』
│ ⿻ *Title:* ${video.title}
│ ⿻ *Duration:* ${video.timestamp}
│ ⿻ *Views:* ${video.views}
│ ⿻ *Author:* ${video.author.name}
│ ⿻ *Link:* ${video.url}
╰─────────────⭑─
📌 *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴛᴏ ᴄʜᴏᴏsᴇ:* 
1. ᴀᴜᴅɪᴏ
2. ᴅᴏᴄᴜᴍᴇɴᴛ
`;

    // Envoie du menu en citant la commande
    const sentMsg = await conn.sendMessage(from, {
      image: { url: data.result.image || '' },
      caption: menuText
    }, { quoted: m });

    // On garde en mémoire l’id du message envoyé et les infos
    const messageID = sentMsg.key.id;

    // Handler d’écoute des réponses
    const messageHandler = async (msgData) => {
      const receivedMsg = msgData.messages?.[0];
      if (!receivedMsg || !receivedMsg.message) return;

      const senderID = receivedMsg.key.participant || receivedMsg.key.remoteJid;
      // On filtre que ce soit la même personne qui a envoyé la commande
      if (senderID !== m.sender) return;

      // On vérifie que la réponse est bien en reply au menu (stanzaId)
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
      if (!isReplyToBot) return;

      // Texte de la réponse
      const receivedText = (receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text || "").trim();

      if (receivedText === "1") {
        await conn.sendMessage(from, {
          audio: { url: data.result.downloadUrl },
          mimetype: "audio/mpeg"
        }, { quoted: receivedMsg });
      } else if (receivedText === "2") {
        await conn.sendMessage(from, {
          document: { url: data.result.downloadUrl },
          mimetype: "audio/mpeg",
          fileName: `${data.result.title}.mp3`,
          caption: "> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*"
        }, { quoted: receivedMsg });
      } else {
        await conn.sendMessage(from, {
          text: "❎ ɪɴᴠᴀʟɪᴅ ᴄʜᴏɪᴄᴇ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ *1* ᴏʀ *2* ᴏɴʟʏ.",
        }, { quoted: receivedMsg });
      }
    };

    // On ajoute l’écouteur global
    conn.ev.on("messages.upsert", messageHandler);

    // Tu peux gérer la suppression de l’écouteur après X temps si tu veux
    // Par exemple après 10 minutes:
    // setTimeout(() => {
    //   conn.ev.off("messages.upsert", messageHandler);
    // }, 10 * 60 * 1000);

  } catch (error) {
    console.error("❌ Error in .play command:", error);
    reply("⚠️ An error occurred while processing your request.");
  }
});
