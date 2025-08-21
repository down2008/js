const { cmd } = require('../command');
const config = require('../config');
const axios = require("axios");

cmd({
  pattern: "alive2",
  desc: "Show alive status with Meta AI fake quoted and photo",
  category: "general",
  react: "🤖",
  filename: __filename
},
async (conn, mek, m, { from }) => {
  try {
    // Télécharge la miniature (pp style Meta AI)
    const thumbUrl = "https://files.catbox.moe/w1l8b0.jpg"; 
    const thumbBuffer = (await axios.get(thumbUrl, { responseType: "arraybuffer" })).data;

    // ✅ Fake quoted avec image miniature
    const metaAIQuoted = {
      key: {
        remoteJid: "status@broadcast",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "MetaAIStatus"
      },
      message: {
        extendedTextMessage: {
          text: "Contact: 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
          title: "Meta AI · Status",
          previewType: "NONE",
          jpegThumbnail: thumbBuffer // miniature injectée
        }
      }
    };

    // Texte Alive
    const aliveText = `✅ ʜᴇʟʟᴏ ${config.ownername || "User"}\n\n🤖 ʙᴏᴛ ɪꜱ ᴏɴʟɪɴᴇ!\n⚡ ɴᴀᴍᴇ: ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ\n📡 ᴍᴏᴅᴇ: Public\n⏰ ᴜᴘᴛɪᴍᴇ: Running...`;

    // Grande image Alive (bannière)
    const imageUrl = "https://files.catbox.moe/w1l8b0.jpg";

    // Envoi avec fake quoted Meta AI
    await conn.sendMessage(
      from,
      {
        image: { url: imageUrl },
        caption: aliveText
      },
      { quoted: metaAIQuoted }
    );

  } catch (e) {
    console.error("Alive2 Error:", e);
    await conn.sendMessage(from, { text: "⚠️ Error in alive2 command" });
  }
});
