import { SlashCommandBuilder } from "@discordjs/builders";
import { executeCommand } from "../types";
import fs from "fs";
import path from "path";
// import { resolve } from "path";
// import getTsFiles from "./getTsFiles";

type commandModule = {
  execute: executeCommand;
  register: SlashCommandBuilder;
};

let seenCommands: {
  [key: string]: commandModule;
} | null = null;

function getAllCommandFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllCommandFiles(fullPath));
    } else if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) &&
      !entry.name.endsWith(".d.ts") &&
      entry.name !== "index.ts" &&
      entry.name !== "index.js"
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const getCommands = async () => {
  if (seenCommands) return seenCommands;
  const commandDir = path.join(process.cwd(), "src", "commands");
  const commandFiles = getAllCommandFiles(commandDir);
  const commands: { [key: string]: commandModule } = {};
  for (const filePath of commandFiles) {
    try {
      const relativePath = path.relative(commandDir, filePath);
      const module = await import(`../commands/${relativePath}`);
      if (module.register && module.execute) {
        const fileName = path.basename(filePath);
        commands[fileName] = module;
      }
    } catch (error) {
      console.error(`Failed to load ${filePath}:`, error);
    }
  }

  seenCommands = commands;
  return commands;
};

export default getCommands;
