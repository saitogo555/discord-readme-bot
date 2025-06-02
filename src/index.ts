import { Client, GatewayIntentBits, Partials, REST, Routes } from "discord.js";
import { CLIENT_ID, DISCORD_TOKEN } from "./config";
import { messageCreateEventHandler } from "./events/messageCreateEvent";
import { messageReactionAddEventHandler } from "./events/messageReactionAddEvent";
import { messageUpdateEventHandler } from "./events/messageUpdateEvent";
import { interactionCreateEventHandler } from "./events/interactionCreateEvent";
import { slashCommandData } from "./commands";

if (!DISCORD_TOKEN) {
	console.error("❌ エラー: DISCORD_TOKENが設定されていません");
	console.error("💡 .envファイルでDISCORD_TOKENを設定してください");
	process.exit(1);
}

const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

console.log("🤖 BOTを起動中...");

client.login(DISCORD_TOKEN);

client.on("ready", async () => {
	console.log("✅ BOTがログインしました");

	console.log("🔄 スラッシュコマンドを登録中...");
	const rest = new REST().setToken(DISCORD_TOKEN);
	await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [slashCommandData.toJSON()] });
	console.log("✅ スラッシュコマンドを登録しました");

	console.log("✅ BOTが正常に起動しました！");
	console.log("============== BOT情報 ==============");
	console.log(`ID: ${client.user?.id}`);
	console.log(`ユーザー名: ${client.user?.tag}`);
});

client.on("error", (error) => {
	console.error("❌ BOTでエラーが発生しました:");
	console.error("エラー詳細:", error.message);
	console.error("スタックトレース:", error.stack);
});

client.on("disconnect", () => {
	console.warn("⚠️ Discordから切断されました");
});

client.on("reconnecting", () => {
	console.log("🔄 Discordへの再接続を試行中...");
});

client.on("messageCreate", messageCreateEventHandler);
client.on("messageUpdate", messageUpdateEventHandler);
client.on("messageReactionAdd", messageReactionAddEventHandler);
client.on("interactionCreate", interactionCreateEventHandler);
