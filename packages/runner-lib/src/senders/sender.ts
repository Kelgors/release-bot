export interface ISender {
  sendMessage(message: string): Promise<void>;
}
