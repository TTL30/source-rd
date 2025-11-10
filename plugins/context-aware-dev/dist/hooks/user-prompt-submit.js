#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
async function handleUserPromptSubmit(input) {
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
        }
        catch {
            // No startup message, output event name so hook succeeds
            const output = {
                hook_event_name: input.hook_event_name
            };
            console.log(JSON.stringify(output));
        }
    }
    catch (error) {
        // Output event name on error so hook doesn't block
        const output = {
            hook_event_name: input.hook_event_name
        };
        console.log(JSON.stringify(output));
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
    let input = null;
    try {
        const inputJson = await readStdin();
        input = JSON.parse(inputJson);
        if (input) {
            await handleUserPromptSubmit(input);
        }
    }
    catch (error) {
        // Output event name on error with fallback
        const eventName = input?.hook_event_name || 'UserPromptSubmit';
        console.log(JSON.stringify({ hook_event_name: eventName }));
    }
    // Ensure output is flushed before exit
    process.stdout.write('', () => {
        process.exit(0);
    });
})();
//# sourceMappingURL=user-prompt-submit.js.map