import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("watch")
  .setDescription("Manage repository watchlist for this server")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Start watching a repository")
      .addStringOption((option) =>
        option.setName("repository").setDescription("The repository to watch (e.g., owner/repo)").setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Stop watching a repository")
      .addStringOption((option) =>
        option
          .setName("repository")
          .setDescription("The repository to stop watching (e.g., owner/repo)")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List all watched repositories"));
