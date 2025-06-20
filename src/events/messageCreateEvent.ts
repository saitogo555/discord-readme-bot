import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { READ_REACTION_EMOJI } from "../config";
import { isTargetMessage } from "../utils/messageUtils";

/**
 * メッセージ作成イベントハンドラー
 */
export async function messageCreateEventHandler(
	message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
	if (!(await isTargetMessage(message))) return;

	await message.react(READ_REACTION_EMOJI);
}
