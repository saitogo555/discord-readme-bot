import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { CLIENT_ID, READ_REACTION_EMOJI } from "../config";
import { getTargetUsers } from "../utils/messageUtils";

/**
 * Discordのメッセージ作成イベントを処理します。\
 * このイベントは、メッセージが作成されたときに発火します。
 * 
 * @param message Discord.jsのMessageオブジェクト
 * @returns 
 */
export async function messageCreateEventHandler(message: OmitPartialGroupDMChannel<Message<boolean>>) {
	if (message.author.bot) return;
	if (!message.guild) return;
	if (!message.mentions.has(CLIENT_ID)) return;
  
  const users = await getTargetUsers(message);
  if (users.length === 0) return;

  await message.react(READ_REACTION_EMOJI)
}