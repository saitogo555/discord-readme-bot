import type { Command } from ".";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { buildErrorEmbed, buildInfoEmbed, buildSuccessEmbed } from "../utils/embedUtils";
import { getTargetUsers } from "../utils/messageUtils";

export const remindCommandHandler: Command = {
	name: "remind",
	description: "指定メッセージの未読者にDMでリマインダーを送信",
	execute: async (interaction) => {
		const messageId = interaction.options.getString("message_id");
		if (!messageId) {
			await interaction.reply({
				embeds: [buildErrorEmbed("メッセージIDを指定してください。")],
				ephemeral: true,
			});
			return;
		}

		// チャンネルを取得
		const channel = interaction.channel;
		if (!channel) {
			await interaction.reply({
				embeds: [buildErrorEmbed("メッセージを取得するチャンネルが見つかりません。")],
				ephemeral: true,
			});
			return;
		}

		// messageIdからメッセージを取得
		const message = await channel.messages.fetch(messageId).catch(() => null);
		if (!message) {
			await interaction.reply({
				embeds: [buildErrorEmbed("指定されたメッセージが見つかりません。")],
				ephemeral: true,
			});
			return;
		}

		// リアクションしたユーザーを取得
		const reactedUsers = new Set();
		for (const reaction of message.reactions.cache.values()) {
			const users = await reaction.users.fetch();
			for (const user of users.values()) {
				if (user.bot || message.author === user) continue;
				reactedUsers.add(user);
			}
		}

		// 未読ユーザーの取得
		const targetUsers = await getTargetUsers(message);
		const unreadUsers = targetUsers.filter((user) => !reactedUsers.has(user));

    // 未読ユーザーがいない場合は終了
    if (unreadUsers.length === 0) {
      await interaction.reply({
        embeds: [buildInfoEmbed("未読のユーザーはいません。")],
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

		// 未読者にDMで未読メッセージへのリンク付きでモダンなスタイルのリマインドメッセージを送信
		for (const user of unreadUsers) {
			try {
				const reminderEmbed = new EmbedBuilder()
					.setTitle("📝 未読メッセージのお知らせ")
					.setDescription("以下のメッセージがまだ未読です。確認をお願いします。")
					.setColor(0x5865f2)
					.addFields(
						{ name: "📍 チャンネル", value: `<#${message.channel.id}>` },
						{ name: "👤 投稿者", value: `<@${message.author.id}>` },
						{
							name: "📅 投稿日時",
							value: `<t:${Math.floor(message.createdTimestamp / 1000)}:f>`,
							inline: true,
						},
						{
							name: "💬 メッセージ内容",
							value: message.content
								? message.content.length > 100
									? `${message.content.substring(0, 100)}...`
									: message.content
								: "*埋め込みまたは添付ファイル*",
							inline: false,
						},
					)
					.setFooter({ text: "メッセージ確認後、👀リアクションをつけてください" })
					.setTimestamp();

				await user.send({
					embeds: [reminderEmbed],
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									style: 5,
									label: "メッセージを確認する",
									url: message.url,
									emoji: { name: "🔗" },
								},
							],
						},
					],
				});
			} catch (error) {
				console.error(`Failed to send reminder to ${user.tag}:`, error);
			}
		}

		await interaction.reply({
			embeds: [buildSuccessEmbed("未読者にリマインダーを送信しました。")],
			flags: [MessageFlags.Ephemeral],
		});
	},
};
