import { EmbedBuilder } from "discord.js";
import { ERROR_COLOR } from "../config";

export const buildErrorEmbed = (text: string) => {
	return new EmbedBuilder().setTitle("❌ エラー").setDescription(text).setColor(ERROR_COLOR);
};
