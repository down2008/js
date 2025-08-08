const config = require("../config");
const prefix = config.PREFIX;
const os = require("os");
const moment = require("moment");
const { cmd, commands } = require("../command");
const { runtime } = require("../lib/functions");

cmd({
  pattern: "alive",
  alias: ["test"],
  desc: "Show styled alive menu",
  category: "main",
  use: ".alive",
  react: "👋",
  filename: __filename
}, async (conn, mek, m, { from, pushname, reply }) => {
  try {
    const totalCommands = commands.length;
    const uptime = runtime(process.uptime());
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const mode = config.MODE || "Public";

    const caption = `
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

    const buttons = [
      {
        buttonId: `${prefix}menu`,
        buttonText: { displayText: "📂 ᴍᴇɴᴜ" },
        type: 1
      },
      {
        buttonId: `${prefix}owner`,
        buttonText: { displayText: "👑 ᴏᴡɴᴇʀ" },
        type: 1
      }
    ];

    await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/qjkpw0.jpg" },
      caption,
      buttons,
      headerType: 4
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    reply("❌ An error occurred while processing your request.");
  }
});
