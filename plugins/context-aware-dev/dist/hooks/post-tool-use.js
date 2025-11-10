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
async function handlePostToolUse(input) {
    try {
        const { tool_name, tool_input, cwd } = input;
        const projectDir = process.env.CLAUDE_PROJECT_DIR || cwd;
        // Only track Write and Edit tools
        if (tool_name !== 'Write' && tool_name !== 'Edit') {
            return;
        }
        // Check if CLAUDE.md exists (if not, no need to track changes for refresh)
        const claudeMdPath = path.join(projectDir, 'CLAUDE.md');
        try {
            await fs.access(claudeMdPath);
        }
        catch {
            return; // No CLAUDE.md, skip tracking
        }
        // Extract file path from tool input
        const filePath = tool_input.file_path || tool_input.path;
        if (!filePath) {
            return;
        }
        // Check if this is a significant change
        const changeType = detectSignificantChange(filePath);
        if (!changeType) {
            return; // Not significant
        }
        // Track the change
        await trackChange(projectDir, changeType, filePath);
        // Check if we should suggest refresh
        await checkAndSuggestRefresh(projectDir);
    }
    catch (error) {
        // Silently fail - don't block Claude Code execution
    }
}
function detectSignificantChange(filePath) {
    const fileName = path.basename(filePath);
    // Dependency file changes
    const dependencyFiles = [
        'package.json',
        'package-lock.json',
        'yarn.lock',
        'requirements.txt',
        'Pipfile',
        'Cargo.toml',
        'Cargo.lock',
        'go.mod',
        'go.sum',
        'pom.xml',
        'build.gradle',
        'Gemfile',
        'Gemfile.lock',
        'composer.json',
        'composer.lock',
    ];
    if (dependencyFiles.includes(fileName)) {
        return 'dependency';
    }
    // Config file changes
    const configFiles = [
        'tsconfig.json',
        'webpack.config.js',
        'vite.config.js',
        'next.config.js',
        'tailwind.config.js',
        '.env.example',
        'docker-compose.yml',
        'Dockerfile',
    ];
    if (configFiles.includes(fileName)) {
        return 'config';
    }
    // New directories in src/
    if (filePath.includes('/src/') && filePath.split('/').length >= 3) {
        const parts = filePath.split('/');
        const srcIndex = parts.indexOf('src');
        if (srcIndex >= 0 && srcIndex + 1 < parts.length) {
            // This is creating a file in a src subdirectory
            return 'structure';
        }
    }
    return null;
}
async function trackChange(projectDir, changeType, filePath) {
    try {
        const claudeDir = path.join(projectDir, '.claude');
        const sessionsDir = path.join(claudeDir, 'sessions');
        await fs.mkdir(sessionsDir, { recursive: true });
        const changesPath = path.join(sessionsDir, 'changes.json');
        // Load existing changes
        let tracker = { changes: [] };
        try {
            const content = await fs.readFile(changesPath, 'utf8');
            tracker = JSON.parse(content);
        }
        catch {
            // File doesn't exist or invalid JSON, start fresh
        }
        // Add new change
        tracker.changes.push({
            type: changeType,
            file: path.basename(filePath),
            timestamp: new Date().toISOString(),
        });
        // Keep only last 10 changes
        if (tracker.changes.length > 10) {
            tracker.changes = tracker.changes.slice(-10);
        }
        // Save tracker
        await fs.writeFile(changesPath, JSON.stringify(tracker, null, 2), 'utf8');
    }
    catch {
        // Silently fail
    }
}
async function checkAndSuggestRefresh(projectDir) {
    try {
        const changesPath = path.join(projectDir, '.claude', 'sessions', 'changes.json');
        // Load tracker
        const content = await fs.readFile(changesPath, 'utf8');
        const tracker = JSON.parse(content);
        // Count recent changes (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        const recentChanges = tracker.changes.filter(c => new Date(c.timestamp) > oneDayAgo);
        // Don't suggest if we already suggested recently (last hour)
        if (tracker.last_suggestion) {
            const lastSuggestion = new Date(tracker.last_suggestion);
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);
            if (lastSuggestion > oneHourAgo) {
                return; // Already suggested recently
            }
        }
        // Suggest refresh if 3+ significant changes
        if (recentChanges.length >= 3) {
            // Group changes by type
            const byType = recentChanges.reduce((acc, change) => {
                acc[change.type] = (acc[change.type] || 0) + 1;
                return acc;
            }, {});
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💡 CLAUDE.md Refresh Suggestion');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('I\'ve detected significant changes to your project:');
            console.log('');
            if (byType.dependency) {
                console.log(`   📦 ${byType.dependency} dependency ${byType.dependency > 1 ? 'changes' : 'change'}`);
            }
            if (byType.config) {
                console.log(`   ⚙️  ${byType.config} configuration ${byType.config > 1 ? 'changes' : 'change'}`);
            }
            if (byType.structure) {
                console.log(`   📁 ${byType.structure} structural ${byType.structure > 1 ? 'changes' : 'change'}`);
            }
            console.log('');
            console.log('Your CLAUDE.md might be outdated. To refresh it, run:');
            console.log('');
            console.log('   /init');
            console.log('');
            console.log('⚠️  Note: /init will overwrite your existing CLAUDE.md.');
            console.log('   Make sure to save any custom notes first!');
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            // Update last suggestion timestamp
            tracker.last_suggestion = new Date().toISOString();
            await fs.writeFile(changesPath, JSON.stringify(tracker, null, 2), 'utf8');
        }
    }
    catch {
        // Silently fail
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