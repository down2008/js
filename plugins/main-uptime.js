const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");
const FormData = require("form-data");
const { cmd } = require("../command");
const config = require('../config');

function formatRemainingTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let days = Math.floor(totalSeconds / (3600 * 24));
  let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  return `*┃❍ ${days} ᴅᴀʏ(s)*\n*┃❍ ${hours} ʜᴏᴜʀ(s)*\n*┃❍ ${minutes} ᴍɪɴᴜᴛᴇ(s)*\n*┃❍ ${seconds} sᴇᴄᴏɴᴅ(s)*`;
}

cmd({
  pattern: "runtime",
  alias: ["uptime", "run"],
  react: "⏳",
  desc: "Show bot alive status and uptime",
  category: "main",
  filename: __filename
}, async (client, message, args, { reply, sender }) => {
  try {
    const uptimeMs = process.uptime() * 1000;
    const uptimeFormatted = formatRemainingTime(uptimeMs);

    const status = `
*𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 𝐈𝐒 𝐑𝐔𝐍𝐍𝐈𝐍𝐆!!*
*𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 𝐔𝐏𝐓𝐈𝐌𝐄 𝐈𝐍𝐅𝐎:*

*╭═════════════════⊷*
${uptimeFormatted}
*╰═════════════════⊷*
    `;

    await client.sendMessage(message.chat, {
      image: { url: config.MENU_IMAGE_URL },
      caption: status.trim(),
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363401051937059@newsletter", // ton channel ID
          newsletterName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
          serverMessageId: 200 // tu peux changer ou mettre aléatoire
        }
      }
    }, { quoted: message });

  } catch (err) {
    console.error("Runtime Command Error:", err);
    await reply(`❌ Error: ${err.message || err}`);
  }
});
