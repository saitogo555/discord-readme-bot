import { MessageFlags, type CacheType, type Interaction } from "discord.js";
import { COMMAND_NAME } from "../config";

export async function interactionCreateEventHandler(interaction: Interaction<CacheType>): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== COMMAND_NAME) return;

  await interaction.reply({
    content: `/${COMMAND_NAME}が実行されました！`,
    flags: MessageFlags.Ephemeral
  });
}