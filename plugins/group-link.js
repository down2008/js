const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

cmd({
  pattern: "invite",
  alias: ["link", "grouplink"],
  desc: "Get group invite link.",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
  try {
    if (!isGroup) {
      return reply("❌ *This command only works in a group chat.*");
    }

    const metadata = await conn.groupMetadata(from);
    const botJid = conn.user.id.includes(":")
      ? conn.user.id.split(":")[0] + "@s.whatsapp.net"
      : conn.user.id;

    const isBotAdmin = metadata.participants
      .some(p => p.id === botJid && (p.admin === "admin" || p.admin === "superadmin"));

    if (!isBotAdmin) {
      return reply("⚠️ *I need to be an admin to get the group invite link.*");
    }

    const inviteCode = await conn.groupInviteCode(from);
    if (!inviteCode) {
      return reply("❌ *Failed to retrieve the group invite code.*");
    }

    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    return reply(`🔗 *Group Invite Link:*\n${inviteLink}`);
  } catch (err) {
    console.error("Invite command error:", err);
    return reply(`❌ *Error:* ${err.message || "Unknown error"}`);
  }
});
