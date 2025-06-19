import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
} from "discord.js";
import type { Command } from ".";
import { buildErrorEmbed, buildInfoEmbed, buildSuccessEmbed } from "../utils/embedUtils";
import { findMessageInGuild, getTargetUsers } from "../utils/messageUtils";

const sendResponse = async (interaction: ChatInputCommandInteraction, embed: EmbedBuilder) => {
	try {
		if (interaction.deferred) {
			await interaction.editReply({ embeds: [embed] });
		} else {
			await interaction.reply({
				embeds: [buildErrorEmbed("処理に時間がかかりすぎました。もう一度お試しください。")],
				flags: [MessageFlags.Ephemeral],
			});
		}
	} catch (error) {
		console.error("Failed to send response:", error);
		await interaction.followUp({
			embeds: [buildErrorEmbed("応答の送信に失敗しました。")],
			flags: [MessageFlags.Ephemeral],
		});
	}
};

export const remindCommandHandler: Command = {
	name: "remind",
	description: "指定メッセージの未読者にDMでリマインダーを送信",
	execute: async (interaction) => {
		// インタラクションの初期応答をエラーハンドリング付きで実行
		try {
			if (!interaction.deferred && !interaction.replied) {
				await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
			} else {
				await interaction.reply({
					embeds: [buildErrorEmbed("処理に時間がかかりすぎました。もう一度お試しください。")],
					flags: [MessageFlags.Ephemeral],
				});
				return;
			}
		} catch (error) {
			console.error("Failed to defer reply:", error);
		}

		// メッセージIDの取得
		const messageId = interaction.options.getString("message_id");
		if (!messageId) {
			sendResponse(interaction, buildErrorEmbed("メッセージIDが指定されていません。"));
			return;
		}

		// サーバーの取得
		const guild = interaction.guild;
		if (!guild) {
			sendResponse(interaction, buildErrorEmbed("このコマンドはサーバー内でのみ使用できます。"));
			return;
		}

		// メッセージの取得
		const message = await findMessageInGuild(guild, messageId);
		if (!message) {
			sendResponse(
				interaction,
				buildErrorEmbed(
					"指定されたメッセージが存在しないか、読み取り権限の無いチャンネルのメッセージです。",
				),
			);
			return;
		}

		// 権限チェック
		const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
		const isSender = interaction.user.id === message.author.id;

		if (!isAdmin && !isSender) {
			sendResponse(
				interaction,
				buildErrorEmbed("このコマンドを実行するには管理者またはメッセージの投稿者である必要があります。"),
			);
			return;
		}

		// 既読ユーザーを取得（リアクションしたユーザー）
		const reactedUsers = new Set();
		for (const reaction of message.reactions.cache.values()) {
			const users = await reaction.users.fetch();
			for (const user of users.values()) {
				if (user.bot || message.author === user) continue;
				reactedUsers.add(user);
			}
		}

		// 未読ユーザーを特定
		const targetUsers = await getTargetUsers(message);
		const unreadUsers = targetUsers.filter((user) => !reactedUsers.has(user));

		if (unreadUsers.length === 0) {
			sendResponse(interaction, buildInfoEmbed("未読のユーザーはいません。"));
			return;
		}

		// 未読者にDMリマインダーを送信
		for (const user of unreadUsers) {
			try {
				const reminderEmbed = new EmbedBuilder()
					.setTitle("📝 未読メッセージのお知らせ")
					.setDescription("以下のメッセージがまだ未読です。確認をお願いします。")
					.setColor(0x5865f2)
					.addFields(
						{ name: "📍 チャンネル", value: `<#${message.channel.id}>` },
						{ name: "👤 投稿者", value: `<@${message.author.id}>` },
						{
							name: "📅 投稿日時",
							value: `<t:${Math.floor(message.createdTimestamp / 1000)}:f>`,
							inline: true,
						},
						{
							name: "💬 メッセージ内容",
							value: message.content
								? message.content.length > 100
									? `${message.content.substring(0, 100)}...`
									: message.content
								: "*埋め込みまたは添付ファイル*",
							inline: false,
						},
					)
					.setFooter({
						text: "メッセージ確認後、👀リアクションをつけてください",
					})
					.setTimestamp();

				await user.send({
					embeds: [reminderEmbed],
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									style: 5,
									label: "メッセージを確認する",
									url: message.url,
									emoji: { name: "🔗" },
								},
							],
						},
					],
				});
			} catch (error) {
				console.error(`Failed to send reminder to ${user.displayName}(@${user.tag}):`, error);
			}
		}

		sendResponse(interaction, buildSuccessEmbed("未読者にリマインダーを送信しました。"));
	},
};
