const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { writeFileSync } = require('fs');
const path = require('path');

let antilinkAction = "off"; // Default state
let warnCount = {}; // Track warnings per user

const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { setConfig, getConfig } = require("../lib/configdb");



// SET BOT IMAGE
cmd({
  pattern: "setbotimage",
  desc: "Set the bot's image URL",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply, isOwner }) => {
  try {
    if (!isOwner && !isCreator) return reply("❗ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
      const quotedMsg = m.quoted;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      if (!mimeType.startsWith("image")) return reply("❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ.");

      const mediaBuffer = await quotedMsg.download();
      const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
      const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
      form.append("reqtype", "fileupload");

      const response = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(tempFilePath);

      if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
        throw new Error(`Catbox upload failed: ${response.data}`);
      }

      imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      return reply("❌ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɪᴍᴀɢᴇ ᴜʀʟ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ.");
    }

    await setConfig("MENU_IMAGE_URL", imageUrl);

    await reply(`✅ ʙᴏᴛ ɪᴍᴀɢᴇ ᴜᴘᴅᴀᴛᴇᴅ.\n\n*ɴᴇᴡ ᴜʀʟ:* ${imageUrl}\n\n♻️ ʀᴇsᴛᴀʀᴛɪɴɢ...`);
    setTimeout(() => exec("pm2 restart all"), 2000);

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

// SET PREFIX
cmd({
  pattern: "setprefix",
  desc: "Set the bot's command prefix",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply, isOwner }) => {
  if (!isOwner && !isCreator) return reply("❗ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
  const newPrefix = args[0]?.trim();
  if (!newPrefix || newPrefix.length > 2) return reply("❌ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴘʀᴇғɪx (1–2 characters).");

  await setConfig("PREFIX", newPrefix);

  await reply(`✅ ᴘʀᴇғɪx ᴜᴘᴅᴀᴛᴇᴅ ᴛᴏ: *${newPrefix}*\n\n♻️ ʀᴇsᴛᴀʀᴛɪɴɢ...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});





// SET OWNER NAME
cmd({
  pattern: "setownername",
  desc: "Set the owner's name",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply, isOwner }) => {
  if (!isOwner && !isCreator) return reply("❗ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
  const name = args.join(" ").trim();
  if (!name) return reply("❌ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ᴏᴡɴᴇʀ ɴᴀᴍᴇ.");

  await setConfig("OWNER_NAME", name);

  await reply(`✅ ᴏᴡɴᴇʀ ɴᴀᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ ᴛᴏ: *${name}*\n\n♻️ ʀᴇsᴛᴀʀᴛɪɴɢ...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});


let antibotAction = "off"; // Default action is off
let warnings = {}; // Store warning counts per user


cmd({
    pattern: "antibot",
    react: "🫟",
    alias: ["antibot"],
    desc: "Enable Antibot and set action (off/warn/delete/kick)",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { q, reply, isGroup, isAdmins, isOwner }) => {

    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isAdmins && !isOwner) return reply("⛔ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴏʀ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    if (!q) {
        return reply(`*📛 ᴄᴜʀʀᴇɴᴛ ᴀɴᴛɪʙᴏᴛ ᴀᴄᴛɪᴏɴ:* ${antibotAction.toUpperCase()}\n\n*🧪 Usage:* .antibot off / warn / delete / kick`);
    }

    const action = q.toLowerCase();
    if (["off", "warn", "delete", "kick"].includes(action)) {
        antibotAction = action;
        return reply(`✅ *ᴀɴᴛɪʙᴏᴛ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ:* ${action.toUpperCase()}`);
    } else {
        return reply("❌ *Invalid action.*\n\n*🫟 ᴇxᴀᴍᴘʟᴇ:* .ᴀɴᴛɪʙᴏᴛ ᴏɴ / ᴡᴀʀɴ / ᴅᴇʟᴇᴛᴇ / ᴋɪᴄᴋ");
    }
});

// Détection de messages suspects (bots joints au groupe)
cmd({
    on: "body"
}, async (conn, mek, m, { from, isGroup, sender, isBotAdmins, isAdmins, reply }) => {
    if (!isGroup || antibotAction === "off") return;

    const messageId = mek?.key?.id || "";
    if (!messageId.startsWith("31F")) return; // messages typiques des bots (ajustable selon tes besoins)

    if (!isBotAdmins) return reply("*❌ ɪ'ᴍ ɴᴏᴛ ᴀɴ ᴀᴅᴍɪɴ, sᴏ ɪ ᴄᴀɴ'ᴛ ᴛᴀᴋᴇ ᴀᴄᴛɪᴏɴ!*");
    if (isAdmins) return; // Ignore les admins

    // Supprimer le message
    await conn.sendMessage(from, { delete: mek.key });

    switch (antibotAction) {
        case "kick":
            await conn.groupParticipantsUpdate(from, [sender], "remove");
            break;

        case "warn":
            warnings[sender] = (warnings[sender] || 0) + 1;
            if (warnings[sender] >= 3) {
                delete warnings[sender];
                await conn.groupParticipantsUpdate(from, [sender], "remove");
            } else {
                return reply(`⚠️ @${sender.split("@")[0]}, ᴡᴀʀɴɪɴɢ ${warnings[sender]}/3! ʙᴏᴛs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!`, {
                    mentions: [sender]
                });
            }
            break;

        case "delete":
            // Message déjà supprimé, pas besoin d'autre action
            break;
    }
});
