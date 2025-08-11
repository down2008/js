const axios = require('axios');
const { cmd } = require('../command');

cmd({
  pattern: "fakechat",
  alias: ["fake-chat","iphone"],
  react: '🖼️',
  desc: "Generate fake chat image via veloria.my.id imagecreator",
  category: "fun",
  use: ".fakechat 12:00|Hi bro|100  OR  .fakechat Hi bro",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    if (!args || args.length === 0) {
      return reply("*Uᴜsᴀɢᴇ* .ғᴀᴋᴇᴄʜᴀᴛ12:00|Hi bʙʀᴏ100  ᴏʀ .ғᴀᴋᴇᴄʜᴀᴛ ʜɪ ʙʀᴏ");
    }

    // Build inputs
    const input = args.join(' ').trim();

    // If user used pipe format time|text|battery
    let time = "12:00";
    let messageText = input;
    let batteryPercentage = "100";

    if (input.includes('|')) {
      const parts = input.split('|').map(p => p.trim());
      if (parts[0]) time = parts[0];
      if (parts[1]) messageText = parts[1];
      if (parts[2]) batteryPercentage = parts[2].replace('%','');
    }

    // If user only passed time-like first arg (e.g. 12:00 Hi) handle loosely
    else if (/^\d{1,2}[:h]\d{2}$/i.test(args[0])) {
      // e.g. "12:00 Hi bro" or "12h:00 Hi bro"
      time = args[0].replace('h', ':');
      messageText = args.slice(1).join(' ') || messageText;
    }

    // sanitize and encode
    const url = `https://www.veloria.my.id/imagecreator/fake-chat?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(messageText)}&batteryPercentage=${encodeURIComponent(batteryPercentage)}`;

    // fetch image as buffer
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
    const imageBuffer = Buffer.from(res.data, 'binary');

    // send image
    await conn.sendMessage(from, {
      image: imageBuffer,
      caption: `Fᴀᴋᴇ ᴄʜᴀᴛ— ${messageText}\nᴛɪᴍᴇ ${time} • ʙᴀᴛᴛᴇʀʏ ${batteryPercentage}%`
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply("*Erreur:* impossible de générer l'image. Vérifie ta commande et réessaie.");
  }
});
