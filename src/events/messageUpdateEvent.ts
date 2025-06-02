import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { READ_REACTION_EMOJI } from "../config";
import { isTargetMessage } from "../utils/messageUtils";

/**
 * Discordのメッセージ更新イベントを処理します。\
 * このイベントは、メッセージが更新されたときに発火します。
 *
 * @param _ 更新前のメッセージ
 * @param newMessage 更新後のメッセージ
 * @returns
 */
export async function messageUpdateEventHandler(
	_: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>,
	newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
) {
	if (!(await isTargetMessage(newMessage))) return;

	await newMessage.react(READ_REACTION_EMOJI);
}
