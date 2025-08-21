const { cmd } = require("../command");

cmd({
  pattern: "promote",
  alias: ["p", "giveadmin", "makeadmin"],
  desc: "Promote a user to admin",
  category: "group",
  react: "🔺",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, isBotAdmins, isAdmins, isGroup, reply }) => {
  try {
    if (!isGroup) return reply("⚠️ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isBotAdmins) return reply("❌ ɪ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ sᴏᴍᴇᴏɴᴇ.");
    if (!isAdmins && !isCreator) return reply("🔐 ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    let user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❓ ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ.");

    const ownerJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    if (user === ownerJid) return reply("👑 ᴛʜᴀᴛ's ᴛʜᴇ ᴏᴡɴᴇʀ's ɴᴜᴍʙᴇʀ! ᴀʟʀᴇᴀᴅʏ ᴘᴏᴡᴇʀғᴜʟ!");

    await conn.groupParticipantsUpdate(from, [user], "promote");
    reply(`✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴘʀᴏᴍᴏᴛᴇᴅ ᴛᴏ ᴀᴅᴍɪɴ!`, { mentions: [user] });

  } catch (err) {
    console.error("Promote Error:", err);
    reply("❌ Failed to promote. Something went wrong.");
  }
});

cmd({
  pattern: "demote",
  alias: ["d", "dismiss", "removeadmin"],
  desc: "Demote a group admin",
  category: "group",
  react: "🔻",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, isBotAdmins, isAdmins, isGroup, reply }) => {
  try {
    if (!isGroup) return reply("⚠️ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isBotAdmins) return reply("❌ ɪ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴅᴇᴍᴏᴛᴇ sᴏᴍᴇᴏɴᴇ.");
    if (!isAdmins && !isCreator) return reply("🔐 ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    let user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❓ ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴛᴏ ᴅᴇᴍᴏᴛᴇ.");

    const ownerJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    if (user === ownerJid) return reply("👑 ᴛʜᴀᴛ's ᴛʜᴇ ᴏᴡɴᴇʀ's ɴᴜᴍʙᴇʀ! ɪ ᴄᴀɴ'ᴛ ᴅᴇᴍᴏᴛᴇ ᴛʜᴀᴛ.");

    await conn.groupParticipantsUpdate(from, [user], "demote");
    reply(`✅ ᴀᴅᴍɪɴ sᴜᴄᴄᴇssғᴜʟʟʏ ᴅᴇᴍᴏᴛᴇᴅ ᴛᴏ ᴀ ɴᴏʀᴍᴀʟ ᴍᴇᴍʙᴇʀ.`, { mentions: [user] });

  } catch (err) {
    console.error("Demote Error:", err);
    reply("❌ Failed to demote. Something went wrong.");
  }
});
