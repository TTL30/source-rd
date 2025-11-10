#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

interface UserPromptSubmitInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  user_prompt: string;
}

async function handleUserPromptSubmit(input: UserPromptSubmitInput): Promise<void> {
  try {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd;
    const startupMsgPath = path.join(projectDir, '.claude', 'sessions', 'startup-message.txt');

    // Check if startup message exists
    try {
      const message = await fs.readFile(startupMsgPath, 'utf8');

      // Output as JSON with event name and additionalContext
      const output = {
        hook_event_name: input.hook_event_name,
        hookSpecificOutput: {
          additionalContext: message
        }
      };

      console.log(JSON.stringify(output));

      // Delete the file after reading
      await fs.unlink(startupMsgPath);
    } catch {
      // No startup message, output event name so hook succeeds
      const output = {
        hook_event_name: input.hook_event_name
      };
      console.log(JSON.stringify(output));
    }
  } catch (error) {
    // Output event name on error so hook doesn't block
    const output = {
      hook_event_name: input.hook_event_name
    };
    console.log(JSON.stringify(output));
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
    const input: UserPromptSubmitInput = JSON.parse(inputJson);
    await handleUserPromptSubmit(input);
  } catch (error) {
    // Output empty JSON on error
    console.log(JSON.stringify({}));
  }
})();
