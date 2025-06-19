import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { READ_REACTION_EMOJI } from "../config";
import { isTargetMessage } from "../utils/messageUtils";

/**
 * メッセージ更新イベントハンドラー
 */
export async function messageUpdateEventHandler(
	_: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>,
	newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
) {
	if (!(await isTargetMessage(newMessage))) return;

	await newMessage.react(READ_REACTION_EMOJI);
}
