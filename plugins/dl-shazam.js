const { cmd } = require('../command');
const acrcloud = require('acrcloud');
const fs = require('fs');
const path = require('path');

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: '716b4ddfa557144ce0a459344fe0c2c9',
  access_secret: 'Lz75UbI8g6AzkLRQgTgHyBlaQq9YT5wonr3xhFkf'
});

cmd({
  pattern: "shazam",
  alias: ["find"],
  use: ".shazam (reply to audio/video)",
  category: "tools",
  desc: "Identify song/music by audio or video",
  filename: __filename
}, async (conn, m, { quoted, react, reply }) => {
  try {
    if (!quoted || !quoted.mimetype || !/audio|video/.test(quoted.mimetype)) {
      await react("❌");
      return reply("❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ *ᴀᴜᴅɪᴏ* ᴏʀ *ᴠɪᴅᴇᴏ* ᴛᴏ ɪᴅᴇɴᴛɪғʏ ᴛʜᴇ sᴏɴɢ.");
    }

    await react("🎧");

    const mediaBuffer = await quoted.download();
    const tempFile = path.join(__dirname, `../temp-${Date.now()}.mp3`);
    fs.writeFileSync(tempFile, mediaBuffer);

    reply("🔍 ɪᴅᴇɴᴛɪғʏɪɴɢ ᴍᴜsɪᴄ, ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...");

    const result = await acr.identify(fs.readFileSync(tempFile));
    fs.unlinkSync(tempFile); // cleanup

    if (result.status.code !== 0) {
      return reply(`❌ Not Found: ${result.status.msg}`);
    }

    const music = result.metadata.music[0];
    const {
      title,
      artists,
      album,
      genres,
      release_date
    } = music;

    const songInfo = `👋 Hi @${m.sender.split("@")[0]}, ʜᴇʀᴇ ɪs ʏᴏᴜʀ ᴍᴜsɪᴄ ɪɴғᴏ:

• 📌 *𝐓𝐈𝐓𝐋𝐄:* ${title}
• 👨‍🎤 *𝐀𝐑𝐓𝐈𝐒𝐓:* ${artists?.map(v => v.name).join(', ') || 'NOT FOUND'}
• 💾 *𝐀𝐋𝐁𝐔𝐌:* ${album?.name || 'NOT FOUND'}
• 🌐 *𝐆𝐄𝐍𝐑𝐄:* ${genres?.map(v => v.name).join(', ') || 'NOT FOUND'}
• 📆 *𝐑𝐄𝐋𝐄𝐀𝐒𝐄 𝐃𝐀𝐓𝐄:* ${release_date || 'NOT FOUND'}
    `.trim();

    // Get user profile picture
    let userPic;
    try {
      userPic = await conn.profilePictureUrl(m.sender, 'image');
    } catch {
      userPic = 'https://files.catbox.moe/roubzi.jpg'; // Fallback
    }

    // Send message with song info and thumbnail
    await conn.sendMessage(m.chat, {
      text: songInfo,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
          newsletterJid: "120363401051937059@newsletter"
        },
        externalAdReply: {
          title: "🎧 Music Finder Result",
          body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ",
          thumbnailUrl: userPic,
          mediaType: 1,
          renderLargerThumbnail: false, // Small image only
          sourceUrl: "https://contacte-dyby-tech.vercel.app/"
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply("❌ Failed to identify the music.");
  }
});
