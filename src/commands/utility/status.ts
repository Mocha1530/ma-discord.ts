import {
  ContainerBuilder,
  SeparatorBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "@discordjs/builders";
import { executeCommand } from "@/types";
import { discord_api } from "@/utils/discord-api";
import { MessageFlags } from "discord.js";

export const register = new SlashCommandBuilder()
  .setName("status")
  .setDescription("description of your command");

export const execute: executeCommand = async (interaction) => {
  // This part gets API latency
  const start = Date.now();
  await discord_api.get("/users/@me");
  const apiLatency = Date.now() - start;

  // This the collects serverless metrics
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const vercelRegion = process.env.VERCEL_REGION || "local";

  const container = new ContainerBuilder()
    .setAccentColor(9166826)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("-# MeowAni • Utility • Status"),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Bot Status"),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `>>> **Discord API Latency:** \`${apiLatency}ms\`\n**Instance Uptime:** \`${uptimeSeconds}\`\n**Heap Memory:** \`${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\`\n**Server Region:** \`${vercelRegion}\``,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# Served at ${new Date().toISOString()}`,
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
