// Import necessary libraries.
// 'discord.js' is for interacting with the Discord API.
// 'node-fetch' is for making HTTP requests to your webhook.
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fetch = require('node-fetch');

// --- NO SECRETS HERE ---
// The bot reads the token and webhook URL from the environment variables
// that Docker Compose provides from your .env file.
const token = process.env.DISCORD_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

// Check if the token and webhook URL were loaded correctly.
if (!token) {
    console.error("CRITICAL ERROR: The DISCORD_BOT_TOKEN is not defined. Please check your .env file or Portainer environment variables.");
    process.exit(1); // Exit the process if the token is missing.
}
if (!webhookUrl) {
    console.error("CRITICAL ERROR: The WEBHOOK_URL is not defined. Please check your .env file or Portainer environment variables.");
    process.exit(1); // Exit the process if the webhook is missing.
}

// Create a new Discord client with the necessary "Intents".
// Intents tell Discord what events your bot wants to receive.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Required to see server information.
        GatewayIntentBits.GuildMessages,    // Required to see messages in server channels.
        GatewayIntentBits.MessageContent,   // **REQUIRED** to read the content of messages.
        GatewayIntentBits.DirectMessages,   // Required to see direct messages sent to the bot.
    ],
    // 'Partials' are needed to ensure you can receive events from DMs.
    partials: [Partials.Channel],
});

// This event runs once when the bot successfully connects to Discord.
client.once('ready', () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}`);
});

// This event runs every time a new message is created in a channel or DM the bot has access to.
client.on('messageCreate', async (message) => {
    // Ignore messages sent by other bots (including itself).
    if (message.author.bot) return;

    console.log(`Received message from ${message.author.tag} in channel ${message.channel.id}`);

    // Prepare the data payload to send to your webhook.
    const data = {
        content: message.content,
        author: {
            id: message.author.id,
            username: message.author.username,
        },
        channel: {
            id: message.channel.id,
            // '1' is for DMs, other numbers for server channels.
            type: message.channel.type,
        },
        // If the message is in a server, include server info. Otherwise, it's a DM ('null').
        guild: message.guild ? { id: message.guild.id, name: message.guild.name } : null,
    };

    // Send the data to your webhook using node-fetch.
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            // Log an error if the webhook service responds with an error status.
            console.error(`Webhook failed with status: ${response.status} - ${response.statusText}`);
        } else {
            console.log("Successfully sent data to webhook.");
        }
    } catch (error) {
        // Log an error if the fetch request itself fails (e.g., network issue).
        console.error('Error sending data to webhook:', error);
    }
});

// Login to Discord with the token. This starts the bot.
client.login(token);