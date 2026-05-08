import { Octokit } from "@octokit/rest";
import { env } from "./env.js";
import { GithubWatchJob } from "./github.js";

const octokit = new Octokit({
	auth: env.GITHUB_TOKEN,
});

let timeoutId: NodeJS.Timeout | null = null;
function loop() {
	timeoutId = setTimeout(
		async () => {
			await new GithubWatchJob(octokit).run();
			loop();
		},
		env.INTERVAL_MIN * 60 * 1000,
	);
}

function onExit() {
	console.log("Shutting down...");
	if (timeoutId) clearTimeout(timeoutId);
	process.exit(0);
}
process.on("SIGINT", onExit);
process.on("SIGTERM", onExit);

await new GithubWatchJob(octokit).run();
loop();
