import {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
  type APIInteraction,
} from "discord.js";
import { executeCommand } from "@/types";
import { discord_api } from "@/utils/discord-api";
import os from "os";
import { formattedISODate } from "@/utils/formatDate";
import axios from "axios";

export const register = new SlashCommandBuilder()
  .setName("status")
  .setDescription("description of your command");

export const execute: executeCommand = async (interaction: APIInteraction) => {
  // This part gets API latency
  let apiLatency = 0;
  try {
    const start = Date.now();
    await discord_api.get("/users/@me");
    apiLatency = Date.now() - start;
  } catch {
    apiLatency = -1;
  }

  // This the collects serverless metrics
  const memory = process.memoryUsage();
  const rssMB = (memory.rss / 1024 / 1024).toFixed(2);
  const heapUsedMB = (memory.heapUsed / 1024 / 1024).toFixed(2);
  const heapTotalMB = (memory.heapTotal / 1024 / 1024).toFixed(2);
  const hostRamGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  const uptimeSeconds = Math.floor(process.uptime());
  const vercelRegion = process.env.VERCEL_REGION || "local";

  const sla = await fetchUptime();
  let uptimeSla = `\n\n**Uptime (Last 30 days)**`;
  if (sla) {
    uptimeSla =
      uptimeSla +
      `\n> **Availability:** \`${sla.availability.toFixed(2)}%\`\n> **Downtime:** \`${sla.total_downtime} seconds\`\n> **Incidents:** \`${sla.number_of_incidents}\`\n> **Longest Incident:** \`${sla.longest_incident} seconds\``;
  } else {
    uptimeSla = uptimeSla + "\n> Unavailable";
  }

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
        `**Metrics**\n> **Discord API Latency:** \`${apiLatency}ms\`\n> **Instance Uptime:** \`${uptimeSeconds}s\`\n> **Memory Usage (Process RSS):** \`${rssMB} MB\` used out of \`2048 MB\` limit\n> **Heap (Used / Total):** \`${heapUsedMB} MB / ${heapTotalMB} MB\`\n> **Host RAM:** \`${hostRamGB} GB\`\n> **Server Region:** \`${vercelRegion}\`${uptimeSla}`,
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

async function fetchUptime() {
  const monitorId = "4724536";
  const apiKey = process.env.UPTIME_READ_KEY!;

  if (!monitorId || !apiKey) {
    return null;
  }

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  try {
    const uptimeRes = await axios.get<UptimeSLA>(
      `https://uptime.betterstack.com/api/v2/monitors/${monitorId}/sla`,
      {
        params: { from: formatDate(from), to: formatDate(to) },
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 5000,
      },
    );

    return uptimeRes.data.data.attributes;
  } catch {
    return null;
  }
}

interface UptimeSLA {
  data: {
    id: string;
    type: string;
    attributes: {
      availability: number;
      total_downtime: number;
      number_of_incidents: number;
      longest_incident: number;
      average_incident: number;
    };
  };
}
