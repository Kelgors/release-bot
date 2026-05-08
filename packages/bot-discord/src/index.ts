import { Client, Events, GatewayIntentBits } from "discord.js";
import { deployCommands } from "./deploy.js";
import { env } from "./env.js";
import { prisma } from "./prisma.js";
import { command as watchCommand } from "./watch/command.js";
import { watchHandlers } from "./watch/handlers.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  await deployCommands();
});

// When the bot is added to a guild (installation)
client.on(Events.GuildCreate, async (guild) => {
  await prisma.server.upsert({
    where: { type_remoteId: { type: "discord", remoteId: guild.id } },
    update: {},
    create: { type: "discord", remoteId: guild.id, name: guild.name },
  });
  console.log(`Bot added to guild: ${guild.name} (${guild.id})`);
});

client.on(Events.GuildDelete, async (guild) => {
  await prisma.server.delete({ where: { type_remoteId: { type: "discord", remoteId: guild.id } } });
  console.log(`Bot removed from guild: ${guild.name} (${guild.id})`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = watchCommand.name === interaction.commandName ? watchCommand : null;
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    switch (interaction.options.getSubcommand()) {
      case "add":
        await watchHandlers.add(interaction);
        break;
      case "remove":
        await watchHandlers.remove(interaction);
        break;
      case "list":
        await watchHandlers.list(interaction);
        break;
      default:
        await interaction.reply("Unknown subcommand!");
    }
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}`);
    console.error(error);
  }
});

// Log in to Discord with your client's token
await client.login(env.DISCORD_BOT_TOKEN);
