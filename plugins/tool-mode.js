const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "mode2",
    alias: ["setmode"],
    react: "🔐",
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const modeArg = args[0]?.toLowerCase();
    
    if (modeArg === "private") {
        config.MODE = "private";
        return reply("✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *ᴘʀɪᴠᴀᴛᴇ*.");
    } else if (modeArg === "public") {
        config.MODE = "public";
        return reply("✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *ᴘᴜʙʟɪᴄ*.");
    } else {
        return reply("❌ ɪɴᴠᴀʟɪᴅ ᴍᴏᴅᴇ. ᴘʟᴇᴀsᴇ ᴜsᴇ `.ᴍᴏᴅᴇ ᴘʀɪᴠᴀᴛᴇ` ᴏʀ `.ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ`.");
    }
});
