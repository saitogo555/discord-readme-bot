import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { READ_REACTION_EMOJI } from "../config";
import { isTargetMessage } from "../utils/messageUtils";

/**
 * Discordのメッセージ作成イベントを処理します。\
 * このイベントは、メッセージが作成されたときに発火します。
 *
 * @param message Discord.jsのMessageオブジェクト
 * @returns
 */
export async function messageCreateEventHandler(
	message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
	if (!(await isTargetMessage(message))) return;

	await message.react(READ_REACTION_EMOJI);
}
