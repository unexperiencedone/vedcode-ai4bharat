import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { auth } from "@/auth";

// ── Sandbox config ──────────────────────────────────────────────────────────
//
// Every execution runs inside a fresh, disposable Docker container built from
// docker/sandbox.Dockerfile — no raw host process spawn(). See that file for the
// image definition and PROGRESS.md Part 1 #9 for why this replaced the previous
// unauthenticated, unsandboxed implementation.

const SANDBOX_IMAGE = process.env.EXEC_SANDBOX_IMAGE || "vedcode-sandbox:latest";
const TEMP_ROOT = path.join(os.tmpdir(), "vedcode_exec");
const EXEC_TIMEOUT_SECONDS = 8; // enforced *inside* the container via `timeout`
const HOST_TIMEOUT_MS = (EXEC_TIMEOUT_SECONDS + 5) * 1000; // + container startup slack

type LanguageRunner = {
  ext: string;
  filename: string; // fixed — each request gets its own isolated temp dir, so no collision risk
  /** Shell command executed inside the container, already wrapped in `timeout`. */
  containerCmd: string;
};

// Honest, fixed scope: exactly these 7 languages have a real execution path.
// Nothing else is claimed to work — see WorkspaceEditor's Run-button gating,
// which disables Run entirely for any other file type instead of hitting this
// endpoint and failing.
const LANGUAGES: Record<string, LanguageRunner> = {
  python: {
    ext: "py", filename: "main.py",
    containerCmd: `timeout ${EXEC_TIMEOUT_SECONDS}s python3 main.py`,
  },
  javascript: {
    ext: "js", filename: "main.js",
    containerCmd: `timeout ${EXEC_TIMEOUT_SECONDS}s node main.js`,
  },
  c: {
    ext: "c", filename: "main.c",
    containerCmd: `timeout ${EXEC_TIMEOUT_SECONDS}s sh -c "gcc main.c -o /tmp/a.out && /tmp/a.out"`,
  },
  cpp: {
    ext: "cpp", filename: "main.cpp",
    containerCmd: `timeout ${EXEC_TIMEOUT_SECONDS}s sh -c "g++ main.cpp -o /tmp/a.out && /tmp/a.out"`,
  },
  java: {
    ext: "java", filename: "Main.java",
    containerCmd: `timeout ${EXEC_TIMEOUT_SECONDS}s java Main.java`,
  },
  go: {
    ext: "go", filename: "main.go",
    // GOCACHE defaults to $HOME/.cache/go-build, which isn't writable under
    // --read-only; point it at the writable /tmp tmpfs instead. GOMAXPROCS=1
    // keeps Go's own thread count down to fit the container's --pids-limit
    // (its build+run pipeline is thread-heavy enough to blow past 64 pids
    // otherwise) — consistent with the container's 0.5-CPU allocation anyway.
    // Both found by actually running a container, not by reading the code.
    containerCmd: `timeout ${EXEC_TIMEOUT_SECONDS}s env GOCACHE=/tmp/go-cache GOMAXPROCS=1 go run main.go`,
  },
  rust: {
    ext: "rs", filename: "main.rs",
    containerCmd: `timeout ${EXEC_TIMEOUT_SECONDS}s sh -c "rustc main.rs -o /tmp/a.out && /tmp/a.out"`,
  },
};

async function setupTempRoot() {
  try {
    await fs.mkdir(TEMP_ROOT, { recursive: true });
  } catch (err) {
    console.error("Failed to create exec temp root", err);
  }
}
setupTempRoot();

let imageCheckedOnce = false;
async function ensureSandboxImage(): Promise<string | null> {
  if (imageCheckedOnce) return null; // only pay this cost once per server lifetime
  return new Promise((resolve) => {
    const proc = spawn("docker", ["image", "inspect", SANDBOX_IMAGE], { stdio: "ignore" });
    proc.on("close", (code) => {
      if (code === 0) {
        imageCheckedOnce = true;
        resolve(null);
      } else {
        resolve(
          `Sandbox image "${SANDBOX_IMAGE}" isn't built yet. Run: ` +
          `docker build -t vedcode-sandbox -f docker/sandbox.Dockerfile .`
        );
      }
    });
    proc.on("error", () => {
      resolve(
        "Docker isn't reachable from the server (is Docker Desktop running?). " +
        "Code execution requires it — see docker/sandbox.Dockerfile."
      );
    });
  });
}

function runInContainer(
  hostDir: string,
  containerName: string,
  containerCmd: string,
  stdinData: string
): Promise<{ stdout: string; stderr: string; code: number | null; signal: string | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    const args = [
      "run", "--rm", "-i",
      "--name", containerName,
      "--network", "none",
      "--memory", "128m",
      "--memory-swap", "128m",
      "--cpus", "0.5",
      // Go's build+run pipeline alone can approach ~50 OS threads even with
      // GOMAXPROCS=1 (separate compile/link subprocesses, each threaded) — 64
      // was too tight and failed real Go executions outright. 128 still firmly
      // blocks fork-bomb-style abuse from arbitrary submitted code.
      "--pids-limit", "128",
      "--cap-drop", "ALL",
      "--security-opt", "no-new-privileges",
      "--read-only",
      // `exec` is required — Docker's tmpfs default includes `noexec`, which
      // silently blocks running the very binaries C/C++/Rust/Go compile to
      // /tmp ("Permission denied" with no other indication why). Found by
      // actually running a container, not by reading the code.
      "--tmpfs", "/tmp:rw,exec,size=64m,mode=1777",
      "-v", `${hostDir}:/sandbox:ro`,
      "-w", "/sandbox",
      SANDBOX_IMAGE,
      "sh", "-c", containerCmd,
    ];

    let stdoutData = "";
    let stderrData = "";
    let isFinished = false;
    let timedOut = false;

    const proc = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });

    const timeout = setTimeout(() => {
      if (isFinished) return;
      timedOut = true;
      proc.kill("SIGKILL");
      // Belt-and-suspenders: the in-container `timeout` should already have killed
      // the process, but if the daemon itself is wedged, make sure the container
      // doesn't linger — --rm only cleans up once the container actually stops.
      spawn("docker", ["kill", containerName], { stdio: "ignore" }).on("error", () => {});
    }, HOST_TIMEOUT_MS);

    if (stdinData && proc.stdin) {
      proc.stdin.write(stdinData);
      proc.stdin.end();
    }

    proc.stdout?.on("data", (data) => { stdoutData += data.toString(); });
    proc.stderr?.on("data", (data) => { stderrData += data.toString(); });

    proc.on("close", (code, signal) => {
      isFinished = true;
      clearTimeout(timeout);
      resolve({
        stdout: stdoutData,
        stderr: timedOut ? stderrData + `\n[Execution timed out after ${EXEC_TIMEOUT_SECONDS}s]` : stderrData,
        code: timedOut ? 124 : code,
        signal,
        timedOut,
      });
    });

    proc.on("error", (err) => {
      isFinished = true;
      clearTimeout(timeout);
      resolve({
        stdout: stdoutData,
        stderr: `${err.message}\n(Is Docker installed and running?)`,
        code: 1,
        signal: null,
        timedOut: false,
      });
    });
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { language?: string; code?: string; stdin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { language, code, stdin } = body;
  if (!language || !code) {
    return NextResponse.json({ error: "Language and code are required." }, { status: 400 });
  }

  const runner = LANGUAGES[language.toLowerCase()];
  if (!runner) {
    // Honest failure, not a silent 200 with fabricated output — the client must
    // read this `error` field rather than assuming success. See WorkspaceEditor's
    // handleExecute for the corresponding fix.
    return NextResponse.json(
      { error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGES).join(", ")}.` },
      { status: 400 }
    );
  }

  const imageError = await ensureSandboxImage();
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 503 });
  }

  const runId = crypto.randomUUID();
  const hostDir = path.join(TEMP_ROOT, runId);
  const containerName = `vedcode-exec-${runId}`;

  try {
    await fs.mkdir(hostDir, { recursive: true });
    await fs.writeFile(path.join(hostDir, runner.filename), code);

    const result = await runInContainer(hostDir, containerName, runner.containerCmd, stdin || "");

    return NextResponse.json({
      run: {
        stdout: result.stdout,
        stderr: result.stderr,
        output: result.stderr ? result.stderr : result.stdout,
        code: result.code,
        signal: result.signal,
      },
      language,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    fs.rm(hostDir, { recursive: true, force: true }).catch(() => {});
  }
}
