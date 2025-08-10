const { cmd } = require("../command");  
const { sleep } = require("../lib/functions");  

cmd({  
    pattern: "restart",
    alias: ["reboot"],
    react: "🌀",
    desc: "Restart the bot",  
    category: "owner",  
    filename: __filename  
},  
async (conn, mek, m, { reply, isCreator, isOwner }) => {  
    try {  
        if (!isOwner && !isCreator) {  
            return reply("ᴏɴʟy ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ.");  
        }  

        const { exec } = require("child_process");  
        reply("*ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ ʀᴇꜱᴛᴀʀᴛɪɴɢ*...");  
        await sleep(1500);  
        exec("pm2 restart all");  
    } catch (e) {  
        console.error(e);  
        reply(`${e}`);  
    }  
});
