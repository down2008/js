const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "npm",
  desc: "Search for a package on npm.",
  react: '📦',
  category: "convert",
  filename: __filename,
  use: ".npm <package-name>"
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    // Check if a package name is provided
    if (!args.length) {
      return reply("Please provide the name of the npm package you want to search for. Example: .npm express");
    }

    const packageName = args.join(" ");
    const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    // Fetch package details from npm registry
    const response = await axios.get(apiUrl);
    if (response.status !== 200) {
      throw new Error("Package not found or an error occurred.");
    }

    const packageData = response.data;
    const latestVersion = packageData["dist-tags"].latest;
    const description = packageData.description || "No description available.";
    const npmUrl = `https://www.npmjs.com/package/${packageName}`;
    const license = packageData.license || "Unknown";
    const repository = packageData.repository ? packageData.repository.url : "Not available";

    // Create the response message
    const message = `
*𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 𝐍𝐏𝐌 𝐒𝐄𝐀𝐑𝐂𝐇*

*🔰 𝐍𝐏𝐌 𝐏𝐀𝐂𝐊𝐀𝐆𝐄:* ${packageName}
*📄 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐓𝐈𝐎𝐍:* ${description}
*⏸️ 𝐋𝐀𝐒𝐓 𝐕𝐄𝐑𝐒𝐈𝐎𝐍:* ${latestVersion}
*🪪 𝐋𝐈𝐂𝐄𝐍𝐒𝐄:* ${license}
*🪩 𝐑𝐄𝐏𝐎𝐒𝐈𝐓𝐎𝐑𝐘:* ${repository}
*🔗 𝐍𝐏𝐌 𝐔𝐑𝐋:* ${npmUrl}
`;

    // Send the message
    await conn.sendMessage(from, { text: message }, { quoted: mek });

  } catch (error) {
    console.error("Error:", error);

    // Send detailed error logs to WhatsApp
    const errorMessage = `
*❌ NPM Command Error Logs*

*Error Message:* ${error.message}
*Stack Trace:* ${error.stack || "Not available"}
*Timestamp:* ${new Date().toISOString()}
`;

    await conn.sendMessage(from, { text: errorMessage }, { quoted: mek });
    reply("An error occurred while fetching the npm package details.");
  }
});
