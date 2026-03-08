/**
 * Fetches all TypeScript/JavaScript files from a GitHub repo
 * using the Git Trees API (1 request for tree + batched blob fetches).
 */

const GITHUB_API = 'https://api.github.com';
const CODE_EXTENSIONS = [
    // TypeScript / JavaScript
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    // Python
    '.py', '.pyx', '.pyw',
    // Go
    '.go',
    // Rust
    '.rs',
    // Java / JVM
    '.java', '.kt', '.kts', '.scala', '.groovy',
    // C# / .NET
    '.cs', '.fs',
    // Ruby
    '.rb', '.rake',
    // PHP
    '.php',
    // C / C++
    '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp',
    // Swift
    '.swift',
    // Web templates / components
    '.vue', '.svelte',
    // Dart / Flutter
    '.dart',
    // Shell
    '.sh', '.bash', '.zsh',
    // Elixir / Erlang
    '.ex', '.exs', '.erl',
    // Haskell
    '.hs',
    // Lua
    '.lua',
];
const IGNORED_PATHS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo'];
const MAX_FILES = 200;
const MAX_FILE_SIZE = 100_000; // 100KB

function headers(): Record<string, string> {
    const h: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'VedCode-Constellation',
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
}

export async function parseGithubUrl(
    url: string
): Promise<{ owner: string; repo: string; branch: string }> {
    const match = url
        .trim()
        .match(/github\.com\/([^\/]+)\/([^\/\s]+?)(?:\/tree\/([^\/\s]+))?(?:\/.*)?$/);
    if (!match) throw new Error('Invalid GitHub URL. Expected: https://github.com/owner/repo');

    const [, owner, repoRaw, branchHint] = match;
    const repo = repoRaw.replace(/\.git$/, '');

    let branch = branchHint;
    if (!branch) {
        const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: headers() });
        if (res.status === 404)
            throw new Error(
                `Repo "${owner}/${repo}" not found or is private. Add GITHUB_TOKEN to .env for private repos.`
            );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        branch = data.default_branch;
    }

    return { owner, repo, branch };
}

export async function fetchRepoFiles(
    owner: string,
    repo: string,
    branch: string
): Promise<Map<string, string>> {
    // 1. Fetch recursive file tree (single API call)
    const treeRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers: headers() }
    );
    if (!treeRes.ok)
        throw new Error(`Failed to fetch repo tree: ${treeRes.status} ${treeRes.statusText}`);

    const treeData = await treeRes.json();

    type TreeItem = { path: string; type: string; sha: string; size?: number };
    // 2. Filter to only code files, respect ignore list and size cap
    const blobs: TreeItem[] = (treeData.tree as TreeItem[])
        .filter(
            (item) =>
                item.type === 'blob' &&
                CODE_EXTENSIONS.some((ext) => item.path.endsWith(ext)) &&
                !IGNORED_PATHS.some((ignored) => item.path.split('/').includes(ignored)) &&
                (item.size ?? 0) < MAX_FILE_SIZE
        )
        .slice(0, MAX_FILES);

    if (blobs.length === 0) return new Map();

    // 3. Batch-fetch blob content (20 at a time)
    const files = new Map<string, string>();
    const BATCH = 20;

    for (let i = 0; i < blobs.length; i += BATCH) {
        const batch = blobs.slice(i, i + BATCH);
        await Promise.all(
            batch.map(async (blob) => {
                const res = await fetch(
                    `${GITHUB_API}/repos/${owner}/${repo}/git/blobs/${blob.sha}`,
                    { headers: headers() }
                );
                if (!res.ok) return;
                const data = await res.json();
                const content = Buffer.from(data.content as string, 'base64').toString('utf-8');
                files.set(blob.path, content);
            })
        );
    }

    return files;
}
