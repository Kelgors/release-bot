import z from "zod";
import "dotenv/config";

export const env = z
  .object({
    APP_STAGE: z.enum(["dev", "prod", "test"]),
    DATABASE_URL: z.string(),
    GITHUB_TOKEN: z.string(),
    DISCORD_BOT_TOKEN: z.string().optional(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    INTERVAL_MIN: z.number().default(60),
  })
  .parse(process.env);
