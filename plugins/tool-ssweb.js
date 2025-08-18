/*

$$$$$$\            $$\                                               
$$  __$$\           $$ |                                              
$$ /  \__|$$\   $$\ $$$$$$$\  $$$$$$$$\  $$$$$$\   $$$$$$\   $$$$$$\  
\$$$$$$\  $$ |  $$ |$$  __$$\ \____$$  |$$  __$$\ $$  __$$\ $$  __$$\ 
 \____$$\ $$ |  $$ |$$ |  $$ |  $$$$ _/ $$$$$$$$ |$$ |  \__|$$ /  $$ |
$$\   $$ |$$ |  $$ |$$ |  $$ | $$  _/   $$   ____|$$ |      $$ |  $$ |
\$$$$$$  |\$$$$$$  |$$$$$$$  |$$$$$$$$\ \$$$$$$$\ $$ |      \$$$$$$  |
 \______/  \______/ \_______/ \________| \_______|\__|       \______/

Project Name : SubZero MD
Creator      : Darrell Mucheri ( Mr Frank OFC )
Repo         : https//github.com/mrfrank-ofc/SUBZERO-MD
Support      : wa.me/18062212660
*/





































































































































































































const axios = require("axios");
const config = require('../config');
const { cmd } = require("../command");



cmd({
  pattern: "screenshot",
  react: "🌐",
  alias: ["ss", "ssweb"],
  desc: "Capture a full-page screenshot of a website.",
  category: "utility",
  use: ".screenshot <url>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const url = args[0];
    if (!url) {
      return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴜʀʟ. ᴇxᴀᴍᴘʟᴇ: `.screenshot https://contacte-dyby-tech.vercel.app/`");
    }

    // Validate the URL
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return reply("❌ ɪɴᴠᴀʟɪᴅ ᴜʀʟ. ᴘʟᴇᴀsᴇ ɪɴᴄʟᴜᴅᴇ 'http://' ᴏʀ 'https://'.");
    }

    // Generate the screenshot URL using Thum.io API
    const screenshotUrl = `https://image.thum.io/get/fullpage/${url}`;

    // Send the screenshot as an image message
    await conn.sendMessage(from, {
      image: { url: screenshotUrl },
      caption: `  *🌐 ɢᴇɴᴇʀᴀᴛᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ 🌐*\n\n🔗 *ᴡᴇʙsɪᴛᴇ ᴜʀʟ:* \n${url}`,
      contextInfo: {
        mentionedJid: [msg.sender], // Fix: Use `msg.sender` instead of `m.sender`
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363401051937059@newsletter',
          newsletterName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
          serverMessageId: 143,
        },
      },
    }, { quoted: mek });

  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴄᴀᴘᴛᴜʀᴇ ᴛʜᴇ sᴄʀᴇᴇɴsʜᴏᴛ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.");
  }
});
