import { type CacheType, type Interaction, MessageFlags } from "discord.js";
import { commands } from "../commands";
import { COMMAND_NAME } from "../config";
import { buildErrorEmbed } from "../utils/embedUtils";

/**
 * インタラクションイベントハンドラー
 */
export async function interactionCreateEventHandler(
	interaction: Interaction<CacheType>,
): Promise<void> {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName !== COMMAND_NAME) return;

	// サーバーが存在しない場合、またはインタラクションがサーバー外で発生した場合
	if (!interaction.guild) {
		await interaction.reply({
			embeds: [buildErrorEmbed("このコマンドはサーバー内でのみ使用できます。")],
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	// サブコマンドを実行
	const subcommand = interaction.options.getSubcommand();
	for (const cmd of commands) {
		if (cmd.name === subcommand) {
			await cmd.execute(interaction);
			return;
		}
	}

	// サブコマンドが見つからない場合
	await interaction.reply({
		content: `コマンド「/${COMMAND_NAME} ${subcommand}」は存在しません。`,
		flags: MessageFlags.Ephemeral,
	});
}
