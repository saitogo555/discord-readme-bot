import type { Message, OmitPartialGroupDMChannel } from "discord.js";

/**
 * メッセージでメンションされた対象ユーザーを取得します。\
 * この関数は、メッセージ内でメンションされたユーザーIDの配列を返します。\
 * メンションには、ユーザー、ロール、@everyoneが含まれます。\
 * ただし、ボット自身とメッセージの送信者は除外されます。
 *
 * @param message Discord.jsのMessageオブジェクト
 * @returns メッセージでメンションされたユーザーIDの配列
 */
export async function getTargetUsers(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<string[]> {
	const botId = message.client.user.id;
	const authorId = message.author.id;
	const userIds = new Set<string>();

	if (!message.guild) return [];

	// 直接メンションされたユーザーを取得
	for (const user of message.mentions.users.values()) {
		if (user.id !== botId && user.id !== authorId) {
			userIds.add(user.id);
		}
	}

	// ロールメンションから全ての対象ユーザーを取得
	for (const role of message.mentions.roles.values()) {
		for (const member of role.members.values()) {
			if (!member.user.bot && member.id !== botId && member.id !== authorId) {
				userIds.add(member.id);
			}
		}
	}

	// @everyoneまたは@hereがメンションされた場合、全ての対象ユーザーを取得
	if (message.mentions.everyone) {
		const isEveryoneMentioned = message.content.includes("@everyone");
		const isHereMentioned = message.content.includes("@here");
		const isOnlyOnline = !isEveryoneMentioned && isHereMentioned;
		
		// メンバーキャッシュを更新
		await message.guild.members.fetch(); 

		for (const member of message.guild.members.cache.values()) {
			if (member.user.bot || member.id === botId || member.id === authorId) {
				continue;
			}
			if (isOnlyOnline && member.presence?.status === "offline") {
				continue;
			}
			userIds.add(member.id);
		}
	}

	return Array.from(userIds);
}
