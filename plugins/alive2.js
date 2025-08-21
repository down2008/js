const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "alive2",
  desc: "Show alive status with Meta AI fake quoted, photo & button",
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
          displayName: "🔥LAKIYA MD MINI BOT🔥",
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Lakiya;;;\nFN:🔥LAKIYA MD MINI BOT🔥\nitem1.TEL;waid=2424281102:+242 428 1102\nEND:VCARD",
        }
      }
    };

    // Texte Alive
    const aliveText = `✅ ʜᴇʟʟᴏ ${config.ownername || "User"}\n\n🤖 ʙᴏᴛ ɪꜱ ᴏɴʟɪɴᴇ!\n⚡ ɴᴀᴍᴇ: ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ\n📡 ᴍᴏᴅᴇ: Public\n⏰ ᴜᴘᴛɪᴍᴇ: Running...`;

    // Photo Alive
    const imageUrl = "https://telegra.ph/file/6b6a8b9b74b4e3c62c345.jpg"; 

    // Boutons (compatibles baileys-mod)
    const buttons = [
      { buttonId: ".menu", buttonText: { displayText: "📜 MENU" }, type: 1 },
      { buttonId: ".ping", buttonText: { displayText: "⚡ PING" }, type: 1 }
    ];

    // Envoi avec photo + bouton + fake quoted
    await conn.sendMessage(
      from,
      {
        image: { url: imageUrl },
        caption: aliveText,
        footer: "ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ",
        buttons,
        headerType: 4
      },
      { quoted: metaAIQuoted }
    );

  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: "⚠️ Error in alive command" });
  }
});
