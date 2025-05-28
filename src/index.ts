import { Client, GatewayIntentBits } from "discord.js";
import { messageCreateEventHandler } from "./events/messageCreateEvent";
import { DISCORD_TOKEN } from "./config";

if (!DISCORD_TOKEN) {
	console.error("❌ Error: DISCORD_TOKEN is not set");
	console.error("💡 Please set DISCORD_TOKEN in the .env file");
	process.exit(1);
}

const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

console.log("🤖 Starting Discord Bot...");

client.login(DISCORD_TOKEN);

client.on("ready", () => {
	console.log("✅ Discord Bot started successfully!");
	console.log("============== Bot Information ==============");
	console.log(`ID: ${client.user?.id}`);
	console.log(`Username: ${client.user?.tag}`);
});

client.on("error", (error) => {
	console.error("❌ An error occurred in Discord Bot:");
	console.error("Error details:", error.message);
	console.error("Stack trace:", error.stack);
});

client.on("disconnect", () => {
	console.warn("⚠️ Disconnected from Discord");
});

client.on("reconnecting", () => {
	console.log("🔄 Attempting to reconnect to Discord...");
});

client.on("messageCreate", messageCreateEventHandler);
