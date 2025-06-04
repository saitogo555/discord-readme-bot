import { MessageFlags, type CacheType, type Interaction } from "discord.js";
import { COMMAND_NAME } from "../config";
import { commands } from "../commands";

export async function interactionCreateEventHandler(interaction: Interaction<CacheType>): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== COMMAND_NAME) return;

  const subcommand = interaction.options.getSubcommand();
  for (const cmd of commands) {
    if (cmd.name === subcommand) {
      await cmd.execute(interaction);
      return;
    }
  }

  await interaction.reply({
    content: `コマンド「/${COMMAND_NAME} ${subcommand}」は存在しません。`,
    flags: MessageFlags.Ephemeral
  });
}