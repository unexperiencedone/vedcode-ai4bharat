import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const TEMP_DIR = path.join(os.tmpdir(), "codefusion_exec");

// Ensure temp directory exists
async function setupTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create temp directory", err);
  }
}
setupTempDir();

type LanguageConfig = {
  ext: string;
  command: string;
  args?: (file: string) => string[];
  compileArgs?: (file: string, out: string) => string[];
  runArgs?: (out: string) => string[];
};

const languageConfig: Record<string, LanguageConfig> = {
  python: { ext: "py", command: "python", args: (file) => [file] }, 
  javascript: { ext: "js", command: "node", args: (file) => [file] },
  c: { ext: "c", command: "gcc", compileArgs: (file, out) => [file, "-o", out], runArgs: () => [] },
  cpp: { ext: "cpp", command: "g++", compileArgs: (file, out) => [file, "-o", out], runArgs: () => [] },
  java: { ext: "java", command: "java", args: (file) => [file] }, 
  go: { ext: "go", command: "go", args: (file) => ["run", file] },
  rust: { ext: "rs", command: "rustc", compileArgs: (file, out) => [file, "-o", out], runArgs: () => [] },
};

function runCommand(command: string, args: string[], stdin_data: string, timeoutMs = 5000): Promise<{ stdout: string; stderr: string; code: number | null; signal: string | null }> {
  return new Promise((resolve) => {
    let stdoutData = "";
    let stderrData = "";
    
    // Spawn process
    const proc = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    let isFinished = false;

    // Timeout logic
    const timeout = setTimeout(() => {
      if (!isFinished) {
        proc.kill("SIGKILL");
        resolve({ stdout: stdoutData, stderr: stderrData + "\n[Execution Timed Out after 5s]", code: 124, signal: "SIGKILL" });
      }
    }, timeoutMs);

    // Write standard input if provided
    if (stdin_data && proc.stdin) {
      proc.stdin.write(stdin_data);
      proc.stdin.end();
    }

    proc.stdout?.on("data", (data) => { stdoutData += data.toString(); });
    proc.stderr?.on("data", (data) => { stderrData += data.toString(); });

    proc.on("close", (code, signal) => {
      isFinished = true;
      clearTimeout(timeout);
      resolve({ stdout: stdoutData, stderr: stderrData, code, signal });
    });
    
    proc.on("error", (err) => {
        isFinished = true;
        clearTimeout(timeout);
        resolve({ stdout: stdoutData, stderr: err.message + `\n(Make sure '${command}' is installed on your system)`, code: 1, signal: null });
    });
  });
}

async function executeCode(language: string, version: string, code: string, stdin_data = "") {
  try {
    const langKey = language.toLowerCase();
    const config = languageConfig[langKey];

    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Create unique temporary file
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    // Note: Java single-file source execution requires class name to match or just a generic Main.java
    const fileName = langKey === 'java' ? `Main_${uniqueId}.java` : `main_${uniqueId}.${config.ext}`;
    const filePath = path.join(TEMP_DIR, fileName);
    
    // Save code to temp file
    await fs.writeFile(filePath, code);

    let result;

    if (config.compileArgs) {
      // Compiled Language (C, C++, Rust)
      const executableName = os.platform() === 'win32' ? `out_${uniqueId}.exe` : `out_${uniqueId}`;
      const executablePath = path.join(TEMP_DIR, executableName);

      // 1. Compile
      const compileArgs = config.compileArgs(filePath, executablePath);
      const compileResult = await runCommand(config.command, compileArgs, "");
      
      if (compileResult.code !== 0) {
        result = compileResult; // Execution failed at compile time
      } else {
        // 2. Run
        const runCmd = os.platform() === 'win32' ? executablePath : `./${executableName}`;
        result = await runCommand(runCmd, [], stdin_data, 5000); // 5 sec timeout
      }
      
      // Cleanup executable
      fs.unlink(executablePath).catch(() => {});
    } else if (config.args) {
      // Interpreted Language (Python, JS, Go, Java)
      const executionArgs = config.args(filePath);
      result = await runCommand(config.command, executionArgs, stdin_data, 5000);
    } else {
       throw new Error(`Invalid configuration for language: ${language}`);
    }

    // Cleanup source file
    fs.unlink(filePath).catch(() => {});

    return {
      run: {
        output: result.stderr ? result.stderr : result.stdout,
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code,
        signal: result.signal
      },
      language,
      version: version || "*"
    };
  } catch (error: any) {
    throw new Error("Local execution failed: " + error.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, version, code, stdin } = body;

    if (!language || !code) {
      return NextResponse.json(
        { error: "Language and code are required." },
        { status: 400 }
      );
    }

    const result = await executeCode(language, version || "*", code, stdin || "");
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Execution failed" },
      { status: 500 }
    );
  }
}
