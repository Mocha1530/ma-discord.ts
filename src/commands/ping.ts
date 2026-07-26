import {
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
  type APIInteraction,
} from "discord.js";
import { executeCommand } from "@/types";
import { snowflakeToDate } from "@/utils/user-helpers";

export const register = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("pong's you back! (bot check)");

export const execute: executeCommand = async (interaction: APIInteraction) => {
  const start = snowflakeToDate(interaction.id);

  const container = new ContainerBuilder()
    .setAccentColor(9166826)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("-# MeowAni • Ping"),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## Pong!\n-# Took ${Date.now() - start.valueOf()}ms to respond`,
      ),
    );

  return {
    type: 4,
    data: {
      components: [container.toJSON()],
      flags: MessageFlags.IsComponentsV2,
    },
  };
};
