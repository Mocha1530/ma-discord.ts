// import { SlashCommandBuilder } from "@discordjs/builders";
// import { executeCommand } from "../types";
// import fs from "fs";
// import path from "path";
// import { resolve } from "path";
// import getTsFiles from "./getTsFiles";
//
// type commandModule = {
//   execute: executeCommand;
//   register: SlashCommandBuilder;
// };
//
// let seenCommands: {
//   [key: string]: commandModule;
// } | null = null;
//
// function getAllCommandFiles(dir: string, baseDir: string): string[] {
//   const entries = fs.readdirSync(dir, { withFileTypes: true });
//   let files: string[] = [];
//
//   for (const entry of entries) {
//     const fullPath = path.join(dir, entry.name);
//     if (entry.isDirectory()) {
//       files = files.concat(getAllCommandFiles(fullPath, baseDir));
//     } else if (
//       (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) &&
//       !entry.name.endsWith(".d.ts") &&
//       entry.name !== "index.ts" &&
//       entry.name !== "index.js"
//     ) {
//       const relative = path.relative(baseDir, fullPath);
//       files.push(relative);
//     }
//   }
//   return files;
// }
//
// const getCommands = async () => {
//   if (seenCommands) return seenCommands;
//   const commandDir = path.join(process.cwd(), "src", "commands");
//   const commandFiles = getAllCommandFiles(commandDir, commandDir);
//   const commands: { [key: string]: commandModule } = {};
//   for (const filePath of commandFiles) {
//     try {
//       const module = await import(`../commands/${filePath}`);
//       if (module.register && module.execute) {
//         const fileName = path.basename(filePath);
//         commands[fileName] = module;
//       }
//     } catch (error) {
//       console.error(`Failed to load ${filePath}:`, error);
//     }
//   }
//
//   seenCommands = commands;
//   return commands;
// };
//
// export default getCommands;

import { commands as commandRegistry } from "@/src/commands";
import { executeCommand } from "@/types";
import { SlashCommandBuilder } from "discord.js";

type commandModule = {
  execute: executeCommand;
  register: SlashCommandBuilder;
};

let seenCommands: { [key: string]: commandModule } | null = null;

const getCommands = async () => {
  if (seenCommands) return seenCommands;
  const commands: { [key: string]: commandModule } = {};
  for (const [name, mod] of Object.entries(commandRegistry)) {
    commands[mod.register.name] = mod;
  }

  seenCommands = commands;
  return commands;
};

export default getCommands;
