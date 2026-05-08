import type { ISender } from "./sender.js";

export class TelegramSender implements ISender {
  sendMessage(message: string): Promise<void> {
    console.log(`Sending message to Telegram: ${message}`);
    return Promise.resolve();
  }
}
