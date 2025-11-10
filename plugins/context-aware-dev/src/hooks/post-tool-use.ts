#!/usr/bin/env node

interface PostToolUseInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: Record<string, any>;
  tool_response: Record<string, any>;
}

async function handlePostToolUse(input: PostToolUseInput): Promise<void> {
  try {
    // Phase 1: Basic tool usage logging
    // This will be enhanced in later phases to detect significant changes
    // and suggest CLAUDE.md refresh

    const { tool_name, session_id } = input;

    console.log(`[Context-Aware Plugin] Tool used: ${tool_name}`);
    console.log(`[Context-Aware Plugin] Session: ${session_id.substring(0, 8)}`);
  } catch (error) {
    console.error('[Context-Aware Plugin] Error during post-tool-use:', error);
    // Don't exit with error code to avoid blocking Claude Code execution
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
    const input: PostToolUseInput = JSON.parse(inputJson);
    await handlePostToolUse(input);
  } catch (error) {
    console.error('[Context-Aware Plugin] Fatal error:', error);
    // Don't exit with error code to avoid blocking Claude Code execution
  }
})();
