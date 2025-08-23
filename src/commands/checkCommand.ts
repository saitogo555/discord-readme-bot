import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	MessageFlags,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	type User,
	type Role,
} from "discord.js";
import type { Command } from ".";
import { INFO_COLOR } from "../config";
import { buildErrorEmbed } from "../utils/embedUtils";
import { findMessageInGuild, getTargetUsers, filterUsersByRoles } from "../utils/messageUtils";

// 1ページあたりの表示ユーザー数
const USERS_PER_PAGE = 20;

const sendResponse = async (
	interaction: ChatInputCommandInteraction,
	embed: EmbedBuilder,
	components?: ActionRowBuilder<ButtonBuilder>[],
) => {
	try {
		if (interaction.deferred) {
			await interaction.editReply({
				embeds: [embed],
				components: components ? components : [],
			});
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

export const checkCommandHandler: Command = {
	name: "check",
	description: "指定メッセージの既読状況を確認する",
	execute: async (interaction) => {
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

		// 既読ユーザーを取得（リアクションしたユーザー）
		const reactedUsers = new Set<User>();
		for (const reaction of message.reactions.cache.values()) {
			const users = await reaction.users.fetch();
			for (const user of users.values()) {
				if (user.bot || message.author === user) continue;
				reactedUsers.add(user);
			}
		}

		// 既読・未読ユーザーを分類
		const targetUsers = await getTargetUsers(message);
		
		// フィルターモードの取得
		const filterMode = interaction.options.getString("filter_mode") as "OR" | "AND" | null;
		
		if (filterMode) {
			// フィルターモードが指定されている場合、ロール選択UIを表示
			await showRoleSelection(interaction, targetUsers, reactedUsers, filterMode);
			return;
		}
		
		// フィルターモードが指定されていない場合、通常の処理
		const readUsers = targetUsers.filter((user) => reactedUsers.has(user));
		const unreadUsers = targetUsers.filter((user) => !reactedUsers.has(user));

		await showResults(interaction, readUsers, unreadUsers);
	},
};

async function showRoleSelection(
	interaction: ChatInputCommandInteraction,
	targetUsers: User[],
	reactedUsers: Set<User>,
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
		.setCustomId("role_select")
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
		.setTitle("🔍 ロールフィルター設定")
		.setColor(INFO_COLOR)
		.setDescription(
			`**フィルターモード**: ${filterMode === "OR" ? "OR（いずれかのロールに所属）" : "AND（すべてのロールに所属）"}\n\n対象ユーザーを${filterMode === "OR" ? "選択したロールのいずれか" : "選択したロールすべて"}に所属するユーザーに絞り込みます。`,
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
		filter: (i) => i.user.id === interaction.user.id && i.customId === "role_select",
	});

	if (!collector) return;

	collector.on("collect", async (selectInteraction) => {
		const selectedRoleIds = selectInteraction.values;
		const selectedRoles = selectedRoleIds
			.map((roleId) => guild.roles.cache.get(roleId))
			.filter((role): role is Role => role !== undefined);

		// ユーザーをフィルタリング
		const filteredUsers = filterUsersByRoles(targetUsers, selectedRoles, filterMode, guild);
		const readUsers = filteredUsers.filter((user) => reactedUsers.has(user));
		const unreadUsers = filteredUsers.filter((user) => !reactedUsers.has(user));

		await selectInteraction.update({
			embeds: [],
			components: [],
		});

		await showResults(interaction, readUsers, unreadUsers, selectedRoles, filterMode);
	});

	collector.on("end", () => {
		try {
			interaction.editReply({ components: [] });
		} catch (error) {
			console.error("Failed to remove components:", error);
		}
	});
}

async function showResults(
	interaction: ChatInputCommandInteraction,
	readUsers: User[],
	unreadUsers: User[],
	selectedRoles?: Role[],
	filterMode?: "OR" | "AND",
) {
	// ページネーション用のページ変数定義
	let readPage = 0;
	let unreadPage = 0;

	// Embed作成
	const createEmbed = () => {
		const readUsersText =
			readUsers.length > 0
				? readUsers
						.slice(readPage * USERS_PER_PAGE, (readPage + 1) * USERS_PER_PAGE)
						.map((user) => `<@${user.id}>`)
						.join(", ")
				: "なし";
		const unreadUsersText =
			unreadUsers.length > 0
				? unreadUsers
						.slice(unreadPage * USERS_PER_PAGE, (unreadPage + 1) * USERS_PER_PAGE)
						.map((user) => `<@${user.id}>`)
						.join(", ")
				: "なし";

		const embed = new EmbedBuilder()
			.setTitle("📋 既読状況確認")
			.setColor(INFO_COLOR)
			.setTimestamp()
			.addFields([
				{
					name: `✅ 既読 (${readUsers.length}人)`,
					value: readUsersText,
					inline: false,
				},
				{
					name: `❌ 未読 (${unreadUsers.length}人)`,
					value: unreadUsersText,
					inline: false,
				},
			]);

		// フィルター情報を追加
		if (selectedRoles && selectedRoles.length > 0) {
			const filterDescription = selectedRoles.map((role) => role.name).join(", ");
			embed.addFields({
				name: `🔍 フィルター (${filterMode})`,
				value: `ロール: ${filterDescription}`,
				inline: false,
			});
		}

		return embed;
	};

	// ページネーションコンポーネントの作成
	const createComponent = () => {
		const row = new ActionRowBuilder<ButtonBuilder>();

		// 既読一覧フィールドのページネーションボタン
		if (readUsers.length > USERS_PER_PAGE) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId("read_prev")
					.setLabel("◀️ 既読前")
					.setStyle(ButtonStyle.Success)
					.setDisabled(readPage <= 0),
				new ButtonBuilder()
					.setCustomId("read_next")
					.setLabel("既読次 ▶️")
					.setStyle(ButtonStyle.Success)
					.setDisabled(readPage >= Math.ceil(readUsers.length / USERS_PER_PAGE) - 1),
			);
		}

		// 未読一覧フィールドのページネーションボタン
		if (unreadUsers.length > USERS_PER_PAGE) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId("unread_prev")
					.setLabel("◀️ 未読前")
					.setStyle(ButtonStyle.Danger)
					.setDisabled(unreadPage <= 0),
				new ButtonBuilder()
					.setCustomId("unread_next")
					.setLabel("未読次 ▶️")
					.setStyle(ButtonStyle.Danger)
					.setDisabled(unreadPage >= Math.ceil(unreadUsers.length / USERS_PER_PAGE) - 1),
			);
		}

		return row.components.length > 0 ? [row] : [];
	};

	// 結果を表示
	const embed = createEmbed();
	const components = createComponent();
	sendResponse(interaction, embed, components);

	// ページネーションのインタラクションハンドラー
	if (components.length > 0) {
		const collector = interaction.channel?.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 5 * 60 * 1000, // 5分間有効
			filter: (i) => i.user.id === interaction.user.id,
		});

		if (!collector) {
			return;
		}

		collector.on("collect", async (event) => {
			if (event.user.id !== interaction.user.id) {
				try {
					await event.reply({
						content: "あなたの操作ではありません。",
						flags: [MessageFlags.Ephemeral],
					});
				} catch (error) {
					console.error("Failed to send permission error:", error);
				}
				return;
			}

			if (event.customId === "read_prev") {
				readPage--;
			} else if (event.customId === "read_next") {
				readPage++;
			} else if (event.customId === "unread_prev") {
				unreadPage--;
			} else if (event.customId === "unread_next") {
				unreadPage++;
			}

			// 更新されたEmbedとコンポーネントを表示
			try {
				const updatedEmbed = createEmbed();
				const updatedComponents = createComponent();
				await event.update({
					embeds: [updatedEmbed],
					components: updatedComponents,
				});
			} catch (error) {
				console.error("Failed to update interaction:", error);
			}
		});

		collector.on("end", () => {
			try {
				interaction.editReply({ components: [] }); // コレクター終了時にコンポーネントを削除
			} catch (error) {
				console.error("Failed to remove components:", error);
			}
		});
	}
}
