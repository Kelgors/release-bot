import type { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import type { Repository, ServerType } from "@release-bot/db";
import type { ISender, IWatchJob } from "@release-bot/runner-lib";
import { DiscordSender, TelegramSender } from "@release-bot/runner-lib";
import { prisma } from "./prisma.js";

type LatestReleaseResponse = RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"];

export class GithubWatchJob implements IWatchJob {
  private readonly octokit: Octokit;
  private readonly senders: { [key in ServerType]: ISender };
  private readonly cache: Map<string, LatestReleaseResponse> = new Map();

  constructor(octokit: Octokit) {
    this.octokit = octokit;
    this.senders = {
      discord: new DiscordSender(),
      telegram: new TelegramSender(),
    };
  }

  private async getLastRelease(owner: string, repo: string) {
    const cacheKey = `${owner}/${repo}`;
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) return cachedResponse;

    const response = await this.octokit.repos.getLatestRelease({
      owner,
      repo,
    });
    this.cache.set(cacheKey, response);
    return response;
  }

  private async sendReleaseMessage(repo: Repository, release: LatestReleaseResponse["data"]) {
    await prisma.repository.update({
      where: { id: repo.id },
      data: { lastVersion: release.tag_name },
    });

    const sender = this.senders[repo.senderType];
    if (!sender) throw new Error(`Unsupported sender type: ${repo.senderType}`);

    console.log(`[INFO] Sending message for ${repo.name} to ${repo.senderType}`);
    await sender.sendMessage(`New release for ${repo.name}: ${release.tag_name}\n${release.html_url}`);
  }

  async run() {
    const repositories = await prisma.repository.findMany({
      where: { type: "github" },
      orderBy: { owner: "asc", name: "asc" },
    });

    for (const repo of repositories) {
      const { data: release } = await this.getLastRelease(repo.owner, repo.name);
      if (release.tag_name === repo.lastVersion) {
        console.log(`[SKIP] No new release for ${repo.name} (last: ${repo.lastVersion})`);
        continue;
      }
      console.log(`[INFO] New release found for ${repo.name}: ${release.tag_name}`);

      await this.sendReleaseMessage(repo, release);
    }
  }
}
