#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

interface SessionStartInput {
  session_id: string;
  source: 'startup' | 'resume' | 'clear' | 'compact';
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
}

async function handleSessionStart(input: SessionStartInput): Promise<void> {
  try {
    const { session_id, source, cwd } = input;
    const projectDir = process.env.CLAUDE_PROJECT_DIR || cwd;

    console.log(`[Context-Aware Plugin] Session ${session_id.substring(0, 8)} started (${source})`);
    console.log(`[Context-Aware Plugin] Project: ${projectDir}`);

    // Ensure .claude directory exists
    const claudeDir = path.join(projectDir, '.claude');
    await fs.mkdir(claudeDir, { recursive: true });

    // Ensure artifacts directory exists
    const artifactsDir = path.join(claudeDir, 'artifacts');
    await fs.mkdir(artifactsDir, { recursive: true });

    // Create session-specific artifact directory
    const sessionArtifactsDir = path.join(artifactsDir, session_id);
    await fs.mkdir(sessionArtifactsDir, { recursive: true });

    console.log('[Context-Aware Plugin] ✓ Plugin ready');
    console.log(`[Context-Aware Plugin] Artifacts: .claude/artifacts/${session_id}`);
  } catch (error) {
    console.error('[Context-Aware Plugin] Error during session start:', error);
    process.exit(1);
  }
}

// Read input from stdin (JSON)
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });
  });
}

// Main execution
(async () => {
  try {
    const inputJson = await readStdin();
    const input: SessionStartInput = JSON.parse(inputJson);
    await handleSessionStart(input);
  } catch (error) {
    console.error('[Context-Aware Plugin] Fatal error:', error);
    process.exit(1);
  }
})();
