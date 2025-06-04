import { EmbedBuilder } from "discord.js";
import { ERROR_COLOR, INFO_COLOR, SUCCESS_COLOR } from "../config";

export const buildErrorEmbed = (text: string) => {
	return new EmbedBuilder().setTitle("❌ エラー").setDescription(text).setColor(ERROR_COLOR);
};

export const buildSuccessEmbed = (text: string) => {
	return new EmbedBuilder().setTitle("✅ 成功").setDescription(text).setColor(SUCCESS_COLOR);
};

export const buildInfoEmbed = (text: string) => {
	return new EmbedBuilder().setTitle("ℹ️ 情報").setDescription(text).setColor(INFO_COLOR);
};
