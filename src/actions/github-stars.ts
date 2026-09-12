import { config } from "@/data/config";

// unauthenticated github api = 60 req/hr per ip. This used to be a cached
// Server Action, but Server Actions aren't supported under `output: 'export'`
// (static export has no server to run them on). It's called client-side
// instead now — that's fine since the GitHub REST API is public and CORS-open,
// it just means each visitor's browser makes its own request instead of
// sharing a server-side 5-minute cache.
export async function getGithubStars(): Promise<number> {
  const res = await fetch(
    `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}`,
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (!res.ok) {
    throw new Error(`GitHub API responded with ${res.status}`);
  }

  const data = await res.json();
  if (typeof data.stargazers_count !== "number") {
    throw new Error("Unexpected GitHub API response shape");
  }
  return data.stargazers_count;
}
