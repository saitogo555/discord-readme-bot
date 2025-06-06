import { EmbedBuilder } from "discord.js";
import { ERROR_COLOR, INFO_COLOR, SUCCESS_COLOR } from "../config";

// エラー用埋め込みメッセージを作成
export const buildErrorEmbed = (text: string) => {
	return new EmbedBuilder().setTitle("❌ エラー").setDescription(text).setColor(ERROR_COLOR);
};

// 成功用埋め込みメッセージを作成
export const buildSuccessEmbed = (text: string) => {
	return new EmbedBuilder().setTitle("✅ 成功").setDescription(text).setColor(SUCCESS_COLOR);
};

// 情報用埋め込みメッセージを作成
export const buildInfoEmbed = (text: string) => {
	return new EmbedBuilder().setTitle("ℹ️ 情報").setDescription(text).setColor(INFO_COLOR);
};
