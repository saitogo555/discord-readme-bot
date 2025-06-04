import { EmbedBuilder, MessageFlags } from "discord.js";
import { type Command, commands } from ".";
import { COMMAND_NAME, INFO_COLOR } from "../config";

export const helpCommandHandler: Command = {
	name: "help",
	description: "コマンド一覧を表示する",
	aliases: ["h"],
	execute: async (interaction) => {
		const embed = new EmbedBuilder()
			.setTitle("🤖 コマンド一覧")
			.setDescription("利用可能なコマンドの一覧です")
			.setColor(INFO_COLOR)
			.addFields({
				name: "",
				value: commands
					.map((cmd) => `**/${COMMAND_NAME} ${cmd.name}**: ${cmd.description}`)
					.join("\n"),
			})
			.setTimestamp();

		await interaction.reply({
			embeds: [embed],
			flags: [MessageFlags.Ephemeral],
		});
	},
};
