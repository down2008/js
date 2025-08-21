const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions')
// 1. Shutdown Bot
cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, isCreator }) => {
    if (!isOwner && !isCreator) return reply("❌ You are not the owner!");
    reply("🛑 Shutting down...").then(() => process.exit());
});

// 6. Clear All Chats
cmd({
    pattern: "clearchats",
    alias: ["clear"],
    desc: "Clear all chats from the bot.",
    category: "owner",
    react: "🧹",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, isCreator }) => {
    if (!isOwner && !isCreator) return reply("❌ You are not the owner!");
    try {
        const chats = conn.chats.all();
        for (const chat of chats) {
            await conn.modifyChat(chat.jid, 'delete');
        }
        reply("🧹 All chats cleared successfully!");
    } catch (error) {
        reply(`❌ Error clearing chats: ${error.message}`);
    }
});

// 8. Group JIDs List
cmd({
    pattern: "gjid",
    desc: "Get the list of JIDs for all groups the bot is part of.",
    category: "owner",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, isCreator }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    const groups = await conn.groupFetchAllParticipating();
    const groupJids = Object.keys(groups).join('\n');
    reply(`📝 *Group JIDs:*\n\n${groupJids}`);
});


// delete 

cmd({
  pattern: "delete",
  react: "🗑",
  alias: ["del"],
  desc: "Delete a message intelligently",
  category: "group",
  use: '.del',
  filename: __filename
},
async (conn, mek, m, { reply, isOwner, isAdmins }) => {
  if (!isOwner && !isAdmins) return reply("❌ You don't have permission to delete messages!");
  if (!m.quoted) return reply("❌ Please reply to the message you want to delete.");

  try {
    // If the bot sent the message
    if (m.quoted.fromMe) {
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: m.quoted.id, fromMe: true } });
      return reply("✅ Your message was deleted successfully!");
    }

    // If the bot is admin in a group, can delete anyone's message
    if (m.chat.endsWith("@g.us")) {
      if (!isAdmins) return reply("❌ I need admin privileges to delete others' messages!");
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.quoted.id,
          participant: m.quoted.sender,
          fromMe: false
        }
      });
      return reply("✅ Message deleted successfully!");
    }

    // Otherwise, cannot delete other people's messages
    reply("❌ I can't delete this message because I don't have admin rights and it wasn't sent by me.");
    
  } catch (e) {
    console.log(e);
    reply("❌ Failed to delete the message.");
  }
});
