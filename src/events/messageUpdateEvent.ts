import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { CLIENT_ID, READ_REACTION_EMOJI } from "../config";
import { getTargetUsers } from "../utils/messageUtils";

/**
 * Discordのメッセージ更新イベントを処理します。
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
	if (newMessage.author.bot) return;
	if (!newMessage.guild) return;
	if (!newMessage.mentions.has(CLIENT_ID)) return;

	const users = getTargetUsers(newMessage);
	if (users.length === 0) return;

	await newMessage.react(READ_REACTION_EMOJI);
}
