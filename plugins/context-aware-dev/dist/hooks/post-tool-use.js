#!/usr/bin/env node
"use strict";
async function handlePostToolUse(input) {
    try {
        // Phase 1: Basic tool usage logging
        // This will be enhanced in later phases to detect significant changes
        // and suggest CLAUDE.md refresh
        const { tool_name, session_id } = input;
        console.log(`[Context-Aware Plugin] Tool used: ${tool_name}`);
        console.log(`[Context-Aware Plugin] Session: ${session_id.substring(0, 8)}`);
    }
    catch (error) {
        console.error('[Context-Aware Plugin] Error during post-tool-use:', error);
        // Don't exit with error code to avoid blocking Claude Code execution
    }
}
// Read input from stdin (JSON)
async function readStdin() {
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
        const input = JSON.parse(inputJson);
        await handlePostToolUse(input);
    }
    catch (error) {
        console.error('[Context-Aware Plugin] Fatal error:', error);
        // Don't exit with error code to avoid blocking Claude Code execution
    }
})();
//# sourceMappingURL=post-tool-use.js.map