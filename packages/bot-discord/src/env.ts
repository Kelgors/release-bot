import z from "zod";
import "dotenv/config";

export const env = z
  .object({
    APP_STAGE: z.enum(["dev", "prod", "test"]),
    DATABASE_URL: z.url({ protocol: /^postgres:/ }),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_BOT_TOKEN: z.string(),
  })
  .parse(process.env);
