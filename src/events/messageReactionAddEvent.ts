import type {
	Message,
	MessageReaction,
	MessageReactionEventDetails,
	OmitPartialGroupDMChannel,
	PartialMessageReaction,
	PartialUser,
	User,
} from "discord.js";
import { READ_REACTION_EMOJI } from "../config";
import { isTargetMessage } from "../utils/messageUtils";

/**
 * Discordのメッセージリアクション追加イベントを処理します。\
 * このイベントは、メッセージにリアクションが追加されたときに発火します。
 *
 * @param reaction MessageReactionオブジェクトまたはその部分的なバージョン
 * @param user リアクションを追加したユーザーのUserオブジェクトまたはその部分的なバージョン
 * @param details イベントの詳細情報を含むMessageReactionEventDetailsオブジェクト
 * @returns
 */
export async function messageReactionAddEventHandler(
	reaction: MessageReaction | PartialMessageReaction,
	user: User | PartialUser,
	_details: MessageReactionEventDetails,
) {
	const message: OmitPartialGroupDMChannel<Message<boolean>> = await reaction.message.fetch();

	if (!(await isTargetMessage(message))) return;
	if (reaction.emoji.name === READ_REACTION_EMOJI) return;

	await reaction.users.remove(user.id);
}
