#!/usr/bin/env node
"use strict";
async function handlePostToolUse(toolName, toolOutput) {
    try {
        // Phase 1: Basic tool usage logging
        // This will be enhanced in later phases to detect significant changes
        // and suggest CLAUDE.md refresh
        console.log(`[Context-Aware Plugin] Tool used: ${toolName}`);
        // Log output length for debugging (avoid logging full output which can be large)
        const outputLength = toolOutput ? toolOutput.length : 0;
        console.log(`[Context-Aware Plugin] Output length: ${outputLength} characters`);
    }
    catch (error) {
        console.error('[Context-Aware Plugin] Error during post-tool-use:', error);
        // Don't exit with error code to avoid blocking Claude Code execution
    }
}
// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('[Context-Aware Plugin] Error: Missing required arguments');
    console.error('Usage: post-tool-use.js <tool_name> <tool_output>');
    process.exit(1);
}
const [toolName, toolOutput] = args;
// Execute handler
handlePostToolUse(toolName, toolOutput).catch((error) => {
    console.error('[Context-Aware Plugin] Fatal error:', error);
    // Don't exit with error code to avoid blocking Claude Code execution
});
//# sourceMappingURL=post-tool-use.js.map