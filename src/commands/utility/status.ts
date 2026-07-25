import {
  ContainerBuilder,
  SeparatorBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "@discordjs/builders";
import { executeCommand } from "@/types";
import { discord_api } from "@/utils/discord-api";
import { MessageFlags } from "discord.js";
import os from "os";

export const register = new SlashCommandBuilder()
  .setName("status")
  .setDescription("description of your command");

export const execute: executeCommand = async (interaction) => {
  // This part gets API latency
  const start = Date.now();
  await discord_api.get("/users/@me");
  const apiLatency = Date.now() - start;

  // This the collects serverless metrics
  const memory = process.memoryUsage();
  const rssMB = (memory.rss / 1024 / 1024).toFixed(2);
  const heapUsedMB = (memory.heapUsed / 1024 / 1024).toFixed(2);
  const heapTotalMB = (memory.heapTotal / 1024 / 1024).toFixed(2);
  const hostRamGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
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
        `>>> **Discord API Latency:** \`${apiLatency}ms\`\n**Instance Uptime:** \`${uptimeSeconds}s\`\n**Memory Usage (Process RSS):** \`${rssMB} MB\` used out of \`1024 MB\` limit\n**Heap (Used / Total):** \`${heapUsedMB} MB / ${heapTotalMB} MB\`\n**Host RAM:** \`${hostRamGB} GB\`\n**Server Region:** \`${vercelRegion}\``,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# Served at ${formattedISODate(new Date())}`,
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
