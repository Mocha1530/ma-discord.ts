import { REST, Routes, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const commandsPath = path.join(__dirname, "..", "src", "commands");

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

async function loadCommands() {
  const commandFiles = getAllCommandFiles(commandsPath);
  const commands: any[] = [];

  for (const filePath of commandFiles) {
    try {
      const module = await import(`file://${filePath}`);
      if (module.register && module.register instanceof SlashCommandBuilder) {
        commands.push(module.register.toJSON());
        console.log(`Loaded command ${module.register.name}`);
      } else {
        console.warn(`Skipping ${path.basename(filePath)}: no register export`);
      }
    } catch (error) {
      console.error(`Failed to load ${filePath}:`, error);
    }
  }

  return commands;
}

async function registerCommands() {
  const commands = await loadCommands();

  if (commands.length === 0) {
    console.log("No commands to register.");
    process.exit(1);
  }

  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

  try {
    console.log(`Registering ${commands.length} commands...`);

    await rest.put(
      Routes.applicationCommands(process.env.NEXT_PUBLIC_APPLICATION_ID!),
      { body: commands },
    );

    console.log("Successfully registered all commands globally!");
  } catch (error) {
    console.log("Failed to register commands:", error);
    process.exit(1);
  }
}

registerCommands();
