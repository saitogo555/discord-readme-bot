import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { CLIENT_ID } from "../config";

export function messageCreateEventHandler(message: OmitPartialGroupDMChannel<Message<boolean>>) {
	// Ignore messages from bots
	if (message.author.bot) {
		return;
	}

	// Ignore messages that are not in a guild
	if (!message.guild) {
		return;
	}

	// Ignore messages that do not mention the bot
	if (!message.mentions.has(CLIENT_ID)) {
		return;
	}
  
	// Ignore messages that do not mention any users or roles
  const users = getTargetUsers(message);
  if (users.length === 0) {
    return;
  }

  message.reply({
    content: "対象のメッセージです"
  })
  
}

function getTargetUsers(message: OmitPartialGroupDMChannel<Message<boolean>>) {
	const botId = message.client.user.id;
  const authorId = message.author.id;
	const userIds = new Set<string>();

	// if the message is not in a guild, return an empty array
	if (!message.guild) {
		return [];
	}

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
