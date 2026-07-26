import {
  ContainerBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "@discordjs/builders";
import { fetchBotCommands } from "@/utils/discord-api";
import type { executeCommand } from "@/types";
import { MessageFlags } from "discord.js";

export const register = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Returns a list of registered commands");

export const execute: executeCommand = async (interaction) => {
  // Fetch the registered commands from discord api
  const commandsList = await fetchBotCommands();

  // Format
  const fields = commandsList.data.map(
    (c) => `</${c.name}:${c.id}>\n> ${c.description}`,
  );
  const container = new ContainerBuilder()
    .setAccentColor(9166826)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("-# MeowAni • Utility • Help"),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## Here's the list of registered commands\n${fields.join("\n")}`,
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
