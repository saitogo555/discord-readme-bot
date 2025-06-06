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
 * リアクション追加時の処理
 * 既読管理対象のメッセージで既読リアクション以外が追加された場合、削除する
 */
export async function messageReactionAddEventHandler(
	reaction: MessageReaction | PartialMessageReaction,
	user: User | PartialUser,
	_details: MessageReactionEventDetails,
) {
	const message: OmitPartialGroupDMChannel<Message<boolean>> = await reaction.message.fetch();

	if (!(await isTargetMessage(message))) return;
	if (reaction.emoji.name === READ_REACTION_EMOJI) return;

	// 既読リアクション以外は削除
	await reaction.users.remove(user.id);
}
