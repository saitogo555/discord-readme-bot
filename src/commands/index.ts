import { type CacheType, type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { helpCommandHandler } from "./helpCommand";

export interface Command {
	name: string;
	description: string;
	aliases: string[];
	execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}

export const commands: Command[] = [
	helpCommandHandler,
];

export const slashCommandData = new SlashCommandBuilder()
	.setName("readme")
	.setDescription("既読管理コマンド")
	.addSubcommand((subcommand) => subcommand.setName("help").setDescription("コマンド一覧を表示"))
	.addSubcommand((subcommand) =>
		subcommand
			.setName("check")
			.setDescription("指定メッセージの既読状況を確認")
			.addStringOption((option) =>
				option.setName("message_id").setDescription("確認するメッセージID").setRequired(true),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("remind")
			.setDescription("指定メッセージの未読者にリマインダーを送信")
			.addStringOption((option) =>
				option
					.setName("message_id")
					.setDescription("リマインダーを送信するメッセージID")
					.setRequired(true),
			),
	);
