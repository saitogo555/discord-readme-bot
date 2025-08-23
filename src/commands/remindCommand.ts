import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	ComponentType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
	type Role,
} from "discord.js";
import type { Command } from ".";
import { buildErrorEmbed, buildInfoEmbed, buildSuccessEmbed } from "../utils/embedUtils";
import { findMessageInGuild, getTargetUsers, filterUsersByRoles } from "../utils/messageUtils";
import { INFO_COLOR } from "../config";

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
		
		// フィルターモードの取得
		const filterMode = interaction.options.getString("filter_mode") as "OR" | "AND" | null;
		
		if (filterMode) {
			// フィルターモードが指定されている場合、ロール選択UIを表示
			await showRoleSelectionForRemind(interaction, message, targetUsers, reactedUsers, filterMode);
			return;
		}
		
		// フィルターモードが指定されていない場合、通常の処理
		const unreadUsers = targetUsers.filter((user) => !reactedUsers.has(user));

		if (unreadUsers.length === 0) {
			sendResponse(interaction, buildInfoEmbed("未読のユーザーはいません。"));
			return;
		}

		await sendReminders(unreadUsers, message);
		sendResponse(interaction, buildSuccessEmbed("未読者にリマインダーを送信しました。"));

		await sendReminders(unreadUsers, message);
		sendResponse(interaction, buildSuccessEmbed("未読者にリマインダーを送信しました。"));
	},
};

async function sendReminders(unreadUsers: any[], message: any) {
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
}

async function showRoleSelectionForRemind(
	interaction: ChatInputCommandInteraction,
	message: any,
	targetUsers: any[],
	reactedUsers: Set<any>,
	filterMode: "OR" | "AND",
) {
	const guild = interaction.guild!;
	const roles = guild.roles.cache
		.filter((role) => role.name !== "@everyone" && !role.managed)
		.sort((a, b) => b.position - a.position)
		.first(25); // Discord select menu limit

	if (roles.length === 0) {
		sendResponse(interaction, buildErrorEmbed("選択可能なロールがありません。"));
		return;
	}

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("role_select_remind")
		.setPlaceholder("フィルターに使用するロールを選択してください（複数選択可）")
		.setMinValues(1)
		.setMaxValues(Math.min(roles.length, 10)) // 最大10個まで選択可能
		.addOptions(
			roles.map((role) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(role.name)
					.setValue(role.id)
					.setDescription(`メンバー数: ${role.members.size}人`),
			),
		);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

	const embed = new EmbedBuilder()
		.setTitle("🔍 ロールフィルター設定（リマインダー）")
		.setColor(INFO_COLOR)
		.setDescription(
			`**フィルターモード**: ${filterMode === "OR" ? "OR（いずれかのロールに所属）" : "AND（すべてのロールに所属）"}\n\nリマインダー対象ユーザーを${filterMode === "OR" ? "選択したロールのいずれか" : "選択したロールすべて"}に所属するユーザーに絞り込みます。`,
		)
		.addFields(
			{ name: "📊 対象ユーザー数", value: `${targetUsers.length}人`, inline: true },
		);

	try {
		if (interaction.deferred) {
			await interaction.editReply({
				embeds: [embed],
				components: [row],
			});
		} else {
			await interaction.reply({
				embeds: [embed],
				components: [row],
				flags: [MessageFlags.Ephemeral],
			});
		}
	} catch (error) {
		console.error("Failed to send role selection:", error);
		return;
	}

	// ロール選択の応答を待機
	const collector = interaction.channel?.createMessageComponentCollector({
		componentType: ComponentType.StringSelect,
		time: 5 * 60 * 1000, // 5分間有効
		filter: (i) => i.user.id === interaction.user.id && i.customId === "role_select_remind",
	});

	if (!collector) return;

	collector.on("collect", async (selectInteraction) => {
		const selectedRoleIds = selectInteraction.values;
		const selectedRoles = selectedRoleIds
			.map((roleId) => guild.roles.cache.get(roleId))
			.filter((role): role is Role => role !== undefined);

		// ユーザーをフィルタリング
		const filteredUsers = filterUsersByRoles(targetUsers, selectedRoles, filterMode, guild);
		const unreadUsers = filteredUsers.filter((user) => !reactedUsers.has(user));

		await selectInteraction.update({
			embeds: [],
			components: [],
		});

		if (unreadUsers.length === 0) {
			sendResponse(interaction, buildInfoEmbed("フィルター条件に該当する未読のユーザーはいません。"));
			return;
		}

		await sendReminders(unreadUsers, message);
		
		const filterDescription = selectedRoles.map((role) => role.name).join(", ");
		const resultEmbed = buildSuccessEmbed(
			`フィルター条件（${filterMode}: ${filterDescription}）に該当する${unreadUsers.length}人の未読者にリマインダーを送信しました。`,
		);
		sendResponse(interaction, resultEmbed);
	});

	collector.on("end", () => {
		try {
			interaction.editReply({ components: [] });
		} catch (error) {
			console.error("Failed to remove components:", error);
		}
	});
}
