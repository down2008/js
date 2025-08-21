const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "alive2",
  desc: "Check bot status",
  category: "main",
  react: "💡",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
    // fake quoted comme sur ton screen
    const fakeQuoted = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "🔥MEGALODON MD 🔥",
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Lakiya;;;\nFN:Lakiya\nitem1.TEL;waid=2424281102:+242 428 1102\nEND:VCARD",
          jpegThumbnail: null
        }
      }
    };

    // texte alive
    const text = `ʜᴇʏ 👋\n\n✅ I'm alive and running perfectly!\n\n⚡ Bot: ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ\n👑 Owner: ${config.ownername}\n⏰ Uptime: running...`;

    // envoi avec fake quoted
    await conn.sendMessage(from, { text }, { quoted: fakeQuoted });

  } catch (e) {
    console.log(e);
    reply("⚠️ Error in alive command");
  }
});
