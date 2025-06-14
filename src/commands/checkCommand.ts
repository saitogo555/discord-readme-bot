import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  type User,
} from "discord.js";
import type { Command } from ".";
import { INFO_COLOR } from "../config";
import { buildErrorEmbed } from "../utils/embedUtils";
import { findMessageInGuild, getTargetUsers } from "../utils/messageUtils";

// 1ページあたりの表示ユーザー数
const USERS_PER_PAGE = 20;

export const checkCommandHandler: Command = {
  name: "check",
  description: "指定メッセージの既読状況を確認する",
  execute: async (interaction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const messageId = interaction.options.getString("message_id");
    if (!messageId) {
      await interaction.editReply({
        embeds: [buildErrorEmbed("メッセージIDが指定されていません。")],
      });
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({
        embeds: [
          buildErrorEmbed("このコマンドはサーバー内でのみ使用できます。"),
        ],
      });
      return;
    }

    // メッセージを取得
    const message = await findMessageInGuild(guild, messageId);
    if (!message) {
      await interaction.editReply({
        embeds: [
          buildErrorEmbed(
            "指定されたメッセージが存在しないか、読み取り権限の無いチャンネルのメッセージです。"
          ),
        ],
      });
      return;
    }

    // 既読ユーザーを取得（リアクションしたユーザー）
    const reactedUsers = new Set<User>();
    for (const reaction of message.reactions.cache.values()) {
      const users = await reaction.users.fetch();
      for (const user of users.values()) {
        if (user.bot || message.author === user) continue;
        reactedUsers.add(user);
      }
    }

    // 既読・未読ユーザーを分類
    const targetUsers = await getTargetUsers(message);
    const readUsers = targetUsers.filter((user) => reactedUsers.has(user));
    const unreadUsers = targetUsers.filter((user) => !reactedUsers.has(user));

    // ページネーション用のページ変数定義
    let readPage = 0;
    let unreadPage = 0;

    // Embed作成
    const createEmbed = () => {
      const readUsersText =
        readUsers.length > 0
          ? readUsers
              .slice(readPage * USERS_PER_PAGE, (readPage + 1) * USERS_PER_PAGE)
              .map((user) => `<@${user.id}>`)
              .join(", ")
          : "なし";
      const unreadUsersText =
        unreadUsers.length > 0
          ? unreadUsers
              .slice(
                unreadPage * USERS_PER_PAGE,
                (unreadPage + 1) * USERS_PER_PAGE
              )
              .map((user) => `<@${user.id}>`)
              .join(", ")
          : "なし";

      return new EmbedBuilder()
        .setTitle("📋 既読状況確認")
        .setColor(INFO_COLOR)
        .setTimestamp()
        .addFields([
          {
            name: `✅ 既読 (${readUsers.length}人)`,
            value: readUsersText,
            inline: false,
          },
          {
            name: `❌ 未読 (${unreadUsers.length}人)`,
            value: unreadUsersText,
            inline: false,
          },
        ]);
    };

    // ページネーションコンポーネントの作成
    const createComponent = () => {
      const row = new ActionRowBuilder<ButtonBuilder>();

      // 既読一覧フィールドのページネーションボタン
      if (readUsers.length > USERS_PER_PAGE) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("read_prev")
            .setLabel("◀️ 既読前")
            .setStyle(ButtonStyle.Success)
            .setDisabled(readPage <= 0),
          new ButtonBuilder()
            .setCustomId("read_next")
            .setLabel("既読次 ▶️")
            .setStyle(ButtonStyle.Success)
            .setDisabled(
              readPage >= Math.ceil(readUsers.length / USERS_PER_PAGE) - 1
            )
        );
      }

      // 未読一覧フィールドのページネーションボタン
      if (unreadUsers.length > USERS_PER_PAGE) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("unread_prev")
            .setLabel("◀️ 未読前")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(unreadPage <= 0),
          new ButtonBuilder()
            .setCustomId("unread_next")
            .setLabel("未読次 ▶️")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(
              unreadPage >= Math.ceil(unreadUsers.length / USERS_PER_PAGE) - 1
            )
        );
      }

      return row.components.length > 0 ? [row] : [];
    };

    // 結果を表示
    const embed = createEmbed();
    const components = createComponent();
    const response = await interaction.editReply({
      embeds: [embed],
      components,
    });

    // ページネーションのインタラクションハンドラー
    if (components.length > 0) {
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5 * 60 * 1000, // 5分間有効
      });

      collector.on("collect", async (event) => {
        if (event.user.id !== interaction.user.id) {
          await event.reply({
            content: "あなたの操作ではありません。",
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }

        if (event.customId === "read_prev") {
          readPage--;
        } else if (event.customId === "read_next") {
          readPage++;
        } else if (event.customId === "unread_prev") {
          unreadPage--;
        } else if (event.customId === "unread_next") {
          unreadPage++;
        }

        // 更新されたEmbedとコンポーネントを表示
        const updatedEmbed = createEmbed();
        const updatedComponents = createComponent();
        await event.update({
          embeds: [updatedEmbed],
          components: updatedComponents,
        });
      });

      collector.on("end", () => {
        interaction.editReply({ components: [] }); // コレクター終了時にコンポーネントを削除
      });
    }
  },
};
