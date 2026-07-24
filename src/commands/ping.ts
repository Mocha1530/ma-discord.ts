import { SlashCommandBuilder, type APIInteraction } from "discord.js";
import { executeCommand } from "@/types";

export const register = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("pong's you back! (bot check)");

export const execute: executeCommand = async (interaction: APIInteraction) => {
  return {
    type: 4,
    data: {
      content: `pong! ${interaction.member?.user.username}`,
    },
  };
};
