import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { CLIENT_ID } from "../config";

/**
 * Handles the message creation event in Discord.
 * 
 * @param message Message object from Discord.js
 * @returns 
 */
export function messageCreateEventHandler(message: OmitPartialGroupDMChannel<Message<boolean>>) {
	if (message.author.bot) return;
	if (!message.guild) return;
	if (!message.mentions.has(CLIENT_ID)) return;
  
  const users = getTargetUsers(message);
  if (users.length === 0) return;

  message.reply({
    content: "対象のメッセージです"
  })
  
}

/**
 * Gets the target users mentioned in a message.
 *
 * @param message Message object from Discord.js
 * @returns Array of user IDs mentioned in the message
 */
function getTargetUsers(message: OmitPartialGroupDMChannel<Message<boolean>>) {
	const botId = message.client.user.id;
  const authorId = message.author.id;
	const userIds = new Set<string>();

	if (!message.guild) return [];

	// Get directly mentioned users
	for (const user of message.mentions.users.values()) {
		if (user.id !== botId && user.id !== authorId) {
			userIds.add(user.id);
		}
	}

	// Get target users from role mentions
	for (const role of message.mentions.roles.values()) {
		for (const member of role.members.values()) {
			if (!member.user.bot && member.id !== botId && member.id !== authorId) {
				userIds.add(member.id);
			}
		}
	}

	// Get all members when @everyone is mentioned
	if (message.mentions.everyone) {
		for (const member of message.guild.members.cache.values()) {
			if (!member.user.bot && member.id !== botId && member.id !== authorId) {
				userIds.add(member.id);
			}
		}
	}

	return Array.from(userIds);
}
