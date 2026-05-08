import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { isFormatOk } from "../helpers/isFormatOk.js";
import { prisma } from "../prisma.js";

class RepositoryWatchHandler {
  private async validateGuildId(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | null> {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return null;
    }
    return guildId;
  }

  private async getServer(interaction: ChatInputCommandInteraction<CacheType>, guildId: string) {
    const server = await prisma.server.findUnique({
      where: { type_remoteId: { type: "discord", remoteId: guildId } },
    });
    if (!server) {
      await interaction.reply({
        content: "Server not found in the database.",
        ephemeral: true,
      });
    }
    return server;
  }

  private async validateRepository(
    interaction: ChatInputCommandInteraction<CacheType>,
    repository: string,
  ): Promise<boolean> {
    if (!isFormatOk(repository)) {
      await interaction.reply({
        content: "Invalid repository format. Please use `owner/repo` format.",
        ephemeral: true,
      });
      return false;
    }
    return true;
  }

  async add(interaction: ChatInputCommandInteraction<CacheType>) {
    const repository = interaction.options.getString("repository", true);
    const channelId = interaction.channelId;

    const guildId = await this.validateGuildId(interaction);
    if (!guildId) return;

    if (!channelId) {
      await interaction.reply({
        content: "Channel ID not found.",
        ephemeral: true,
      });
      return;
    }

    const isRepositoryValid = await this.validateRepository(interaction, repository);
    if (!isRepositoryValid) return;

    const server = await this.getServer(interaction, guildId);
    if (!server) return;

    const [owner, repo] = repository.split("/");

    const dbRepository = await prisma.repository.upsert({
      where: { type_owner_name: { type: "github", owner, name: repo } },
      update: {},
      create: { type: "github", owner, name: repo },
    });

    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        serverId: server.id,
        repositoryId: dbRepository.id,
      },
    });

    if (dbSubscription) {
      await interaction.reply({
        content: `Already watching repository ${repository}.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await prisma.subscription.create({
        data: {
          serverId: server.id,
          repositoryId: dbRepository.id,
          channelId: interaction.channelId,
        },
      });

      await interaction.reply({
        content: `Started watching repository ${repository}. The bot will now post updates in this channel.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error adding repository:", error);
      await interaction.reply({
        content: "An error occurred while trying to watch the repository.",
        ephemeral: true,
      });
    }
  }

  async remove(interaction: ChatInputCommandInteraction<CacheType>) {
    const repository = interaction.options.getString("repository", true);

    const guildId = await this.validateGuildId(interaction);
    if (!guildId) return;

    const isRepositoryValid = await this.validateRepository(interaction, repository);
    if (!isRepositoryValid) return;

    const server = await this.getServer(interaction, guildId);
    if (!server) return;

    const [owner, repo] = repository.split("/");

    const dbRepository = await prisma.repository.findUnique({
      where: { type_owner_name: { type: "github", owner, name: repo } },
    });

    if (!dbRepository) {
      await interaction.reply({
        content: `Repository ${repository} is not being watched.`,
        ephemeral: true,
      });
      return;
    }

    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        serverId: server.id,
        repositoryId: dbRepository.id,
      },
    });

    if (!dbSubscription) {
      await interaction.reply({
        content: `Repository ${repository} is not being watched in this server.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await prisma.subscription.delete({ where: { id: dbSubscription.id } });

      await interaction.reply({
        content: `Stopped watching repository ${repository}. The bot will no longer post updates in this channel.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error removing repository:", error);
      await interaction.reply({
        content: "An error occurred while trying to unwatch the repository.",
        ephemeral: true,
      });
    }
  }

  async list(interaction: ChatInputCommandInteraction<CacheType>) {
    const guildId = await this.validateGuildId(interaction);
    if (!guildId) return;

    const server = await this.getServer(interaction, guildId);
    if (!server) return;

    const subscriptions = await prisma.subscription.findMany({
      where: { serverId: server.id },
      include: { repository: true },
    });

    if (subscriptions.length === 0) {
      await interaction.reply({
        content: "No repositories are being watched in this server.",
        ephemeral: true,
      });
      return;
    }

    const repositoryList = subscriptions.map((sub) => `- ${sub.repository.owner}/${sub.repository.name}`).join("\n");

    await interaction.reply({
      content: `${repositoryList}`,
      ephemeral: true,
    });
  }
}

export const watchHandlers = new RepositoryWatchHandler();
