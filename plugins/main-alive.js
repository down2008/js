const config = require("../config");
const prefix = config.PREFIX;
const os = require("os");
const { cmd, commands } = require("../command");
const { runtime } = require("../lib/functions");

cmd({
  pattern: "alive",
  alias: ["test"],
  desc: "Show styled alive menu",
  category: "main",
  use: ".alive",
  react: "🤖",
  filename: __filename
}, async (dyby, mek, m, { from, sender, reply }) => {
  try {
    const totalCommands = commands.length;
    const uptime = runtime(process.uptime());
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const mode = config.MODE || "Public";

    const dybymenu = `
⟣──────────────────⟢
┋ *ᴄʀᴇᴀᴛᴏʀ* : *ᴅʏʙʏ ᴛᴇᴄʜ*
┋ *ᴍᴏᴅᴇ* : *${mode}* 
┋ *ᴘʀᴇғɪx* : *${prefix}*
┋ *ᴏᴡɴᴇʀ ɴᴀᴍᴇ* : ${config.OWNER_NAME}
┋ *ʀᴀᴍ* : ${ramUsed}MB / ${ramTotal}MB 
┋ *ᴠᴇʀsɪᴏɴ* : *2.0.0* 
┋ *ᴜᴘᴛɪᴍᴇ* : ${uptime}
┋ *ᴄᴏᴍᴍᴀɴᴅs* : ${totalCommands}
⟣──────────────────⟢`.trim();

    await dyby.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/2r9wy7.jpg" },
      caption: dybymenu,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: config.newsletterJid || "120363401051937059@newsletter",
          newsletterName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    await dyby.sendMessage(from, { react: { text: "❌", key: m.key } });
    reply("❌ An error occurred while processing your request.");
  }
});
