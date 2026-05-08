import type { ISender } from "./sender.js";

export class DiscordSender implements ISender {
  sendMessage(message: string): Promise<void> {
    console.log(`Sending message to Discord: ${message}`);
    return Promise.resolve();
  }
}
