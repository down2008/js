const { cmd } = require('../command');

// Fixed & Created By DybyTech 
cmd({
  pattern: "hidetag",
  alias: ["tag", "h"],  
  react: "🔊",
  desc: "To Tag all Members for Any Message/Media",
  category: "group",
  use: '.hidetag Hello',
  filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isCreator, isAdmins, participants, reply }) => {
  try {
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isAdmins && !isCreator) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    const mentionAll = { mentions: participants.map(u => u.id) };

    let messageText = q || m.quoted?.text || "> 📨 ᴍᴇssᴀɢᴇ";

    // Format the message with your style
    const styledText = `⟣──────────────────⟢
┋ *ᴍᴇssᴀɢᴇ* : ${messageText}
⟣──────────────────⟢`;

    // If it's a quoted media, attach it
    if (m.quoted && ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(m.quoted.mtype)) {
      const buffer = await m.quoted.download?.();
      if (!buffer) return reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴛʜᴇ ᴍᴇᴅɪᴀ.");

      let content;
      switch (m.quoted.mtype) {
        case "imageMessage":
          content = { image: buffer, caption: styledText, ...mentionAll };
          break;
        case "videoMessage":
          content = { video: buffer, caption: styledText, gifPlayback: m.quoted.message?.videoMessage?.gifPlayback || false, ...mentionAll };
          break;
        case "audioMessage":
          content = { audio: buffer, mimetype: "audio/mp4", ptt: m.quoted.message?.audioMessage?.ptt || false, ...mentionAll };
          break;
        case "stickerMessage":
          content = { sticker: buffer, ...mentionAll };
          break;
        case "documentMessage":
          content = {
            document: buffer,
            mimetype: m.quoted.message?.documentMessage?.mimetype || "application/octet-stream",
            fileName: m.quoted.message?.documentMessage?.fileName || "file",
            caption: styledText,
            ...mentionAll
          };
          break;
      }
      return await conn.sendMessage(from, content, { quoted: mek });
    }

    // Otherwise, send as text
    await conn.sendMessage(from, { text: styledText, ...mentionAll }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred !!*\n\n${e.message}`);
  }
});
