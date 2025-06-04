import { type CacheType, type Interaction, MessageFlags } from "discord.js";
import { commands } from "../commands";
import { COMMAND_NAME } from "../config";
import { buildInfoEmbed } from "../utils/embedUtils";

export async function interactionCreateEventHandler(
	interaction: Interaction<CacheType>,
): Promise<void> {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName !== COMMAND_NAME) return;

	const subcommand = interaction.options.getSubcommand();
	for (const cmd of commands) {
		if (cmd.name === subcommand || cmd.aliases.includes(subcommand)) {
			await cmd.execute(interaction);
			return;
		}
	}

	// buildInfoEmbedを使って、コマンドが存在しないことを通知
	// ここでは、MessageFlags.Ephemeralを使用して、ユーザーにのみ表示されるメッセージを送信
	await interaction.reply({
		embeds: [buildInfoEmbed(`コマンド「/${COMMAND_NAME} ${subcommand}」は存在しません。`)],
		flags: MessageFlags.Ephemeral,
	});
}
