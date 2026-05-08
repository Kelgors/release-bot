import { REST, Routes } from "discord.js";
import { env } from "./env.js";
import { command as watchCommand } from "./watch/command.js";

const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);
const commands = watchCommand.toJSON();

export async function deployCommands() {
  try {
    console.log(`Started refreshing application (/) commands.`);
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: [commands] });
    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}
