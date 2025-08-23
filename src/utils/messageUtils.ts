import type { Guild, Message, User, Role } from "discord.js";
import { CLIENT_ID } from "../config";

/**
 * 既読管理対象のメッセージかどうかを判定
 */
export async function isTargetMessage(message: Message<boolean>): Promise<boolean> {
	if (message.author.bot) return false;
	if (!message.guild) return false;
	if (!message.mentions.has(CLIENT_ID)) return false;
	const users = await getTargetUsers(message);
	if (users.length === 0) return false;
	return true;
}

/**
 * メッセージでメンションされた対象ユーザーを取得
 * ボット自身とメッセージ送信者は除外される
 */
export async function getTargetUsers(message: Message<boolean>): Promise<User[]> {
	const botId = message.client.user.id;
	const authorId = message.author.id;
	const users = new Set<User>();

	if (!message.guild) return [];

	// 直接メンションされたユーザーを取得
	for (const user of message.mentions.users.values()) {
		if (user.id !== botId && user.id !== authorId) {
			users.add(user);
		}
	}

	// ロールメンションから対象ユーザーを取得
	for (const role of message.mentions.roles.values()) {
		for (const member of role.members.values()) {
			if (!member.user.bot && member.id !== botId && member.id !== authorId) {
				users.add(member.user);
			}
		}
	}

	// @everyone または @here の処理
	if (message.mentions.everyone) {
		const isEveryoneMentioned = message.content.includes("@everyone");
		const isHereMentioned = message.content.includes("@here");
		const isOnlyOnline = !isEveryoneMentioned && isHereMentioned;

		// メンバーキャッシュを更新してから処理
		await message.guild.members.fetch();

		for (const member of message.guild.members.cache.values()) {
			if (member.user.bot || member.id === botId || member.id === authorId) {
				continue;
			}
			// @here の場合はオンラインユーザーのみ
			if (isOnlyOnline && member.presence?.status === "offline") {
				continue;
			}
			users.add(member.user);
		}
	}

	return Array.from(users);
}

export async function findMessageInGuild(guild: Guild, messageId: string): Promise<Message | null> {
	// ギルド内のすべてのチャンネルを取得
	const channels = await guild.channels.fetch();
	if (channels.size === 0) return null;

	// 各チャンネルからメッセージを検索
	for (const channel of channels.values()) {
		if (!channel) continue;
		if (!channel.isTextBased()) continue;
		if (!channel.viewable) continue;
		const message = await channel.messages.fetch(messageId).catch(() => null);
		if (message) return message;
	}
	return null;
}

/**
 * ロールに基づいてユーザーをフィルタリング
 */
export function filterUsersByRoles(
	users: User[],
	selectedRoles: Role[],
	filterMode: "OR" | "AND",
	guild: Guild,
): User[] {
	if (selectedRoles.length === 0) {
		return users;
	}

	return users.filter((user) => {
		const member = guild.members.cache.get(user.id);
		if (!member) return false;

		const userRoleIds = member.roles.cache.map((role) => role.id);
		const selectedRoleIds = selectedRoles.map((role) => role.id);

		if (filterMode === "OR") {
			// ORモード: いずれかのロールに所属していればtrue
			return selectedRoleIds.some((roleId) => userRoleIds.includes(roleId));
		} else {
			// ANDモード: すべてのロールに所属していればtrue
			return selectedRoleIds.every((roleId) => userRoleIds.includes(roleId));
		}
	});
}
