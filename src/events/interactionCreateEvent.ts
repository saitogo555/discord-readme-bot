import { MessageFlags, PermissionFlagsBits, type CacheType, type Interaction } from "discord.js";
import { COMMAND_NAME } from "../config";
import { commands } from "../commands";
import { buildErrorEmbed } from "../utils/embedUtils";

export async function interactionCreateEventHandler(
	interaction: Interaction<CacheType>,
): Promise<void> {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName !== COMMAND_NAME) return;

	// 権限のあるユーザーのみが実行できるようにする
	if (
		!interaction.guild ||
		!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
	) {
		await interaction.reply({
			embeds: [buildErrorEmbed("このコマンドを実行する権限がありません。")],
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const subcommand = interaction.options.getSubcommand();
	for (const cmd of commands) {
		if (cmd.name === subcommand) {
			await cmd.execute(interaction);
			return;
		}
	}

	await interaction.reply({
		content: `コマンド「/${COMMAND_NAME} ${subcommand}」は存在しません。`,
		flags: MessageFlags.Ephemeral,
	});
}
