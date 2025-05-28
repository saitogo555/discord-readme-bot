import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { CLIENT_ID, READ_REACTION_EMOJI } from "../config";

/**
 * Discordのメッセージ作成イベントを処理します。
 * 
 * @param message Discord.jsのMessageオブジェクト
 * @returns 
 */
export async function messageCreateEventHandler(message: OmitPartialGroupDMChannel<Message<boolean>>) {
	if (message.author.bot) return;
	if (!message.guild) return;
	if (!message.mentions.has(CLIENT_ID)) return;
  
  const users = getTargetUsers(message);
  if (users.length === 0) return;

  await message.react(READ_REACTION_EMOJI)
}

/**
 * メッセージでメンションされた対象ユーザーを取得します。
 *
 * @param message Discord.jsのMessageオブジェクト
 * @returns メッセージでメンションされたユーザーIDの配列
 */
function getTargetUsers(message: OmitPartialGroupDMChannel<Message<boolean>>) {
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

	// ロールメンションから対象ユーザーを取得
	for (const role of message.mentions.roles.values()) {
		for (const member of role.members.values()) {
			if (!member.user.bot && member.id !== botId && member.id !== authorId) {
				userIds.add(member.id);
			}
		}
	}

	// @everyoneがメンションされた場合、すべてのメンバーを取得
	if (message.mentions.everyone) {
		for (const member of message.guild.members.cache.values()) {
			if (!member.user.bot && member.id !== botId && member.id !== authorId) {
				userIds.add(member.id);
			}
		}
	}

	return Array.from(userIds);
}
