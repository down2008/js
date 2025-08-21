const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "alive2",
  desc: "Show alive status with Meta AI fake quoted and photo",
  category: "general",
  react: "🤖",
  filename: __filename
},
async (conn, mek, m, { from }) => {
  try {
    // Fake quoted "Meta AI · Status"
    const metaAIQuoted = {
      key: {
        remoteJid: "status@broadcast",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "MetaAI"
      },
      message: {
        contactMessage: {
          displayName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Lakiya;;;\nFN:🔥LAKIYA MD MINI BOT🔥\nitem1.TEL;waid=2424281102:+242 428 1102\nEND:VCARD",
        }
      },
      participant: "0@s.whatsapp.net"
    };

    // Texte Alive
    const aliveText = `✅ ʜᴇʟʟᴏ ${config.ownername || "User"}\n\n🤖 ʙᴏᴛ ɪꜱ ᴏɴʟɪɴᴇ!\n⚡ ɴᴀᴍᴇ: ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ\n📡 ᴍᴏᴅᴇ: Public\n⏰ ᴜᴘᴛɪᴍᴇ: Running...`;

    // Photo à afficher (tu peux remplacer par ton URL)
    const imageUrl = "https://files.catbox.moe/w1l8b0.jpg"; 

    // Envoi avec photo + fake quoted
    await conn.sendMessage(
      from,
      { 
        image: { url: imageUrl }, 
        caption: aliveText 
      },
      { quoted: metaAIQuoted }
    );

  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: "⚠️ Error in alive command" });
  }
});
