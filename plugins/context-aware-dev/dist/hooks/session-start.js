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
async function handleSessionStart(input) {
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
        // Ensure sessions directory exists
        const sessionsDir = path.join(claudeDir, 'sessions');
        await fs.mkdir(sessionsDir, { recursive: true });
        // Write current session ID to file for slash commands to access
        const currentSessionFile = path.join(sessionsDir, 'current-session.txt');
        await fs.writeFile(currentSessionFile, session_id, 'utf8');
        console.log('[Context-Aware Plugin] ✓ Plugin ready');
        console.log(`[Context-Aware Plugin] Session: ${session_id.substring(0, 8)}`);
        console.log(`[Context-Aware Plugin] Artifacts: .claude/artifacts/${session_id}`);
        // Check for CLAUDE.md and suggest initialization on startup (not resume)
        if (source === 'startup') {
            await checkAndSuggestClaudeMd(projectDir);
        }
    }
    catch (error) {
        console.error('[Context-Aware Plugin] Error during session start:', error);
        process.exit(1);
    }
}
async function checkAndSuggestClaudeMd(projectDir) {
    try {
        const claudeMdPath = path.join(projectDir, 'CLAUDE.md');
        // Check if CLAUDE.md exists
        try {
            await fs.access(claudeMdPath);
            // CLAUDE.md exists, no need to suggest
            return;
        }
        catch {
            // CLAUDE.md doesn't exist, continue checking
        }
        // Check if this is an existing project (has code files)
        const hasExistingCode = await isExistingProject(projectDir);
        if (hasExistingCode) {
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💡 Project Setup Suggestion');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('I notice this is an existing project without a CLAUDE.md file.');
            console.log('');
            console.log('🎯 Why create CLAUDE.md?');
            console.log('   • Helps me understand your codebase architecture faster');
            console.log('   • Persists project context across all sessions');
            console.log('   • Documents build commands, testing, and conventions');
            console.log('   • Makes me more productive from the start');
            console.log('');
            console.log('📝 To create it, run:');
            console.log('');
            console.log('   /init');
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
        }
    }
    catch (error) {
        // Silently fail - this is just a suggestion
    }
}
async function isExistingProject(projectDir) {
    try {
        const entries = await fs.readdir(projectDir, { withFileTypes: true });
        // Check for common indicators of an existing project
        const indicators = [
            'package.json', // Node.js project
            'requirements.txt', // Python project
            'Cargo.toml', // Rust project
            'go.mod', // Go project
            'pom.xml', // Java/Maven project
            'build.gradle', // Java/Gradle project
            'Gemfile', // Ruby project
            'composer.json', // PHP project
            '.git', // Git repository
        ];
        // Check if any indicators exist
        const hasIndicator = entries.some(entry => indicators.includes(entry.name));
        if (hasIndicator) {
            return true;
        }
        // Also check if there are multiple source files
        const sourceFiles = entries.filter(entry => entry.isFile() && (entry.name.endsWith('.ts') ||
            entry.name.endsWith('.js') ||
            entry.name.endsWith('.py') ||
            entry.name.endsWith('.rs') ||
            entry.name.endsWith('.go') ||
            entry.name.endsWith('.java') ||
            entry.name.endsWith('.rb') ||
            entry.name.endsWith('.php')));
        // If 3+ source files, consider it an existing project
        return sourceFiles.length >= 3;
    }
    catch {
        return false;
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
        await handleSessionStart(input);
    }
    catch (error) {
        console.error('[Context-Aware Plugin] Fatal error:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=session-start.js.map