import { EmbedBuilder, MessageFlags } from "discord.js";
import type { Command } from ".";
import { INFO_COLOR } from "../config";

export const usageCommandHandler: Command = {
	name: "usage",
	description: "ReadmeBotの使い方を表示",
	execute: async (interaction) => {
		const embed = new EmbedBuilder()
			.setTitle("📖 ReadmeBot 使い方ガイド")
			.setColor(INFO_COLOR)
			.addFields(
				{
					name: "🤖 Readme Botとは",
					value:
						"メッセージの既読管理と未読ユーザーへのリマインドをするBOTです。特定の条件でメッセージを自動的に既読管理対象し、👀リアクションで既読管理をします。",
				},
				{ name: "\u200B", value: "\u200B" },
				{
					name: "📋 基本的な使い方",
					value:
						"1. ReadmeBotをメンションして対象ユーザーもメンションしたメッセージを送信\n2. BOTが自動で👀リアクションを追加\n3. 対象ユーザーがメッセージを読んだら👀リアクションをクリック\n4. 管理者が既読状況を確認したり、未読者にリマインダーを送信",
				},
				{ name: "\u200B", value: "\u200B" },
				{
					name: "👥 既読管理対象ユーザーの指定方法",
					value:
						"• **個別指定**: `@ユーザー1 @ユーザー2`\n• **ロール指定**: `@グループA @グループB`\n• **全員指定**: `@everyone`\n• **オンラインメンバー指定**: `@here`",
				},
				{ name: "\u200B", value: "\u200B" },
				{
					name: "👀 既読の方法",
					value:
						"メッセージを読んだら、BOTが自動で追加した👀リアクションをクリックしてください。\n⚠️ 注意：👀以外のリアクションは自動で削除されます。",
				},
				{ name: "\u200B", value: "\u200B" },
				{
					name: "📝 使用例",
					value:
						"```\n@ReadmeBot @開発チーム\n明日のリリースについて重要な変更があります。\n必ず15時までに確認をお願いします。\n```\n↓ BOTが👀リアクションを自動追加\n↓ 開発チームメンバーが確認後👀をクリック\n↓ `/readme check メッセージID` で既読状況確認\n↓ `/readme remind メッセージID` で未読者にDMリマインダー",
				},
			)
			.setTimestamp();

		await interaction.reply({
			embeds: [embed],
			flags: [MessageFlags.Ephemeral],
		});
	},
};
