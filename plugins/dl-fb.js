const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return reply("*`Need a valid Facebook URL!`*");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://lance-frank-asta.onrender.com/api/downloader?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    const resultList = data?.content?.data?.result;

    if (!data?.content?.status || !resultList?.length) {
      throw new Error("Invalid API response or no video found.");
    }

    const videoData = resultList.find(v => v.quality === "HD") || resultList.find(v => v.quality === "SD");
    if (!videoData) throw new Error("No valid video URL found.");

    const title = data.content.data.title || "Unknown Title";
    const quality = videoData.quality || "Unknown";

    const formattedInfo = `📥 *ᴠɪᴅᴇᴏ ᴅᴇᴛᴀɪʟs*\n\n` +
                          `🔖 *ᴛɪᴛʟᴇ*: ${title}\n` +
                          `📏 *ǫᴜᴀʟɪᴛʏ*: ${quality}\n\n` +
                          `> © *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

    await conn.sendMessage(from, {
      video: { url: videoData.url },
      caption: formattedInfo,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363401051937059@newsletter',
          newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
          serverMessageId: 143
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error("FB Download Error:", error);

    // Send error details to bot owner
    const ownerNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    await conn.sendMessage(ownerNumber, {
      text: `⚠️ *FB Downloader Error!*\n\n📍 *Group/User:* ${from}\n💬 *Query:* ${q}\n❌ *Error:* ${error.message || error}`
    });

    // Notify the user
    reply("❌ *Error:* Unable to process the request. Please try again later.");
  }
});
