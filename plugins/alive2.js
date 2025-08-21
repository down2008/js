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
          vcard: "BEGIN:VCARD\r\nVERSION:3.0\r\nN:;Dyby;;;\r\nFN:𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃\r\nitem1.TEL;waid=2424281102:+242 428 1102\r\nEND:VCARD"
        }
      }
    };

    const aliveText = `✅ ʜᴇʟʟᴏ ${config.OWNER_NAME | "User"}\n\n🤖 ʙᴏᴛ ɪꜱ ᴏɴʟɪɴᴇ!\n⚡ ɴᴀᴍᴇ: ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ\n📡 ᴍᴏᴅᴇ: Public\n⏰ ᴜᴘᴛɪᴍᴇ: Running...`;

    const imageUrl = "https://files.catbox.moe/w1l8b0.jpg";

    const buttons = [
      { buttonId: ".menu", buttonText: { displayText: "📜 MENU" }, type: 1 },
      { buttonId: ".ping", buttonText: { displayText: "⚡ PING" }, type: 1 }
    ];

    await conn.sendMessage(
      from,
      {
        image: { url: imageUrl },
        caption: aliveText,
        footer: "ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ",
        buttons: buttons,
        headerType: 1 // changed to 1 for image with buttons
      },
      { quoted: metaAIQuoted }
    );

  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: "⚠️ Error in alive command" });
  }
});
