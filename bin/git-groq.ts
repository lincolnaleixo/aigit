#!/usr/bin/env bun
/**
 * git-groq.ts
 * Automates git add/commit/push and asks Groq for a Conventional-Commit message.
 */

import { exec } from "node:child_process";
import { createInterface } from "node:readline";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";

/* -------------------------------------------------------------------------- */
/* 1) Helper functions                                                        */
/* -------------------------------------------------------------------------- */

function execAsync(cmd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 100 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        (err as any).stdout = stdout;
        (err as any).stderr = stderr;
        return reject(err);
      }
      resolve({ stdout, stderr });
    });
  });
}

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 2) Load or request the Groq API key                                        */
/* -------------------------------------------------------------------------- */

async function loadGroqKey(): Promise<string> {
  let key = process.env.GROQ_API_KEY ?? "";
  if (key) return key;

  // First run: ask user
  key = await ask("Enter your Groq API key (it will be saved to your shell profile):\n> ");

  if (!key) throw new Error("Empty key, aborting.");

  // Choose which profile to update
  const shell = process.env.SHELL ?? "";
  const profileFile = shell.includes("zsh") ? ".zshrc" : ".bashrc";
  const profilePath = path.join(os.homedir(), profileFile);

  const exportLine = `\nexport GROQ_API_KEY="${key}"\n`;

  // Append only if it is not already there
  const already = fs.existsSync(profilePath) && fs.readFileSync(profilePath, "utf8").includes(exportLine.trim());
  if (!already) fs.appendFileSync(profilePath, exportLine);

  console.log(`Saved to ${profilePath}. Open a new terminal or run "source ~/${profileFile}" to load it now.`);
  return key;
}

/* -------------------------------------------------------------------------- */
/* 3) Groq API call                                                           */
/* -------------------------------------------------------------------------- */

function cleanCommit(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("<"))
    .join("\n")
    .trim();
}

async function aiCommit(summary: string, apiKey: string): Promise<string> {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-r1-distill-llama-70b",
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 512,
      stream: false,
      messages: [
        {
          role: "system",
          content: [
            "You are a git commit-message expert.",
            "Follow the Conventional Commits spec:",
            "",
            "1) A short subject line, eg. \"feat: add login page\"",
            "2) A blank line",
            "3) A body with at least one full sentence.",
            "",
            "Output only the commit message, nothing else.",
          ].join("\n"),
        },
        {
          role: "user",
          content: ["Write a commit message from the information below.", "", "---", summary].join("\n"),
        },
      ],
    }),
  });

  if (!resp.ok) throw new Error(`Groq API error ${resp.status}: ${await resp.text()}`);

  const j = (await resp.json()) as any;
  return cleanCommit(j.choices?.[0]?.message?.content ?? "");
}

/* -------------------------------------------------------------------------- */
/* 4) Git automation                                                          */
/* -------------------------------------------------------------------------- */

async function runGit(): Promise<void> {
  console.log("Starting git operations...");

  const changes = await execAsync("git status --porcelain");
  if (!changes.stdout) {
    console.log("No changes to commit");
    return;
  }

  const summary = await execAsync(`
    echo "### GIT STATUS ###"
    git status
    echo ""
    echo "### STAGED ###"
    git --no-pager diff --cached --shortstat
    echo ""
    echo "### UNSTAGED ###"
    git --no-pager diff --shortstat
    echo ""
    echo "### RECENT COMMITS ###"
    git --no-pager log --oneline -n 5
  `);

  const key = await loadGroqKey();

  let msg = "";
  try {
    msg = await aiCommit(summary.stdout, key);
    console.log("AI commit message:\n", msg);
  } catch (e: any) {
    console.log("AI failed:", e.message);
  }

  if (!msg) msg = await ask("Enter a commit message:\n> ");

  const tmp = path.join(os.tmpdir(), `commit_${Date.now()}.txt`);
  fs.writeFileSync(tmp, msg);

  await execAsync("git add .");
  await execAsync(`git commit -F ${tmp}`);
  await execAsync("git push");
  fs.unlinkSync(tmp);

  console.log("Done.");
}

/* -------------------------------------------------------------------------- */
/* 5) Entrypoint                                                              */
/* -------------------------------------------------------------------------- */

(async () => {
  try {
    await runGit();
  } catch (e: any) {
    console.error("Process failed:", e.message);
    process.exit(1);
  }
})();