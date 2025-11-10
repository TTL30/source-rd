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
        // Check for CLAUDE.md and suggest initialization
        // Only on 'startup' to avoid being too noisy on every resume
        if (source === 'startup') {
            await checkAndSuggestClaudeMd(projectDir);
        }
        // Check for incomplete work on both startup AND resume
        // (Users want to know about unfinished work whenever they start working)
        if (source === 'startup' || source === 'resume') {
            await checkForIncompleteWork(projectDir, artifactsDir);
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
async function checkForIncompleteWork(projectDir, artifactsDir) {
    const debugLog = [];
    try {
        debugLog.push('=== Smart Resumption Debug Log ===');
        debugLog.push(`Time: ${new Date().toISOString()}`);
        debugLog.push(`Project Dir: ${projectDir}`);
        debugLog.push(`Artifacts Dir: ${artifactsDir}`);
        // Scan artifacts directory for session folders
        const entries = await fs.readdir(artifactsDir, { withFileTypes: true });
        const sessionDirs = entries.filter(entry => entry.isDirectory());
        debugLog.push(`Found ${sessionDirs.length} session directories`);
        if (sessionDirs.length === 0) {
            debugLog.push('No previous work, exiting');
            await writeDebugLog(projectDir, debugLog);
            return; // No previous work
        }
        // Load metadata from all sessions
        const sessions = [];
        for (const dir of sessionDirs) {
            try {
                const metadataPath = path.join(artifactsDir, dir.name, 'metadata.json');
                debugLog.push(`Trying to load: ${metadataPath}`);
                const metadataContent = await fs.readFile(metadataPath, 'utf8');
                const metadata = JSON.parse(metadataContent);
                sessions.push(metadata);
                debugLog.push(`✓ Loaded: ${metadata.session_id.substring(0, 8)} | status: ${metadata.status} | feature: ${metadata.feature_name}`);
            }
            catch (error) {
                debugLog.push(`✗ Failed to load ${dir.name}: ${error}`);
                // Skip sessions without metadata or with invalid JSON
                continue;
            }
        }
        debugLog.push(`Total sessions loaded: ${sessions.length}`);
        // Find incomplete work (status != "completed", "done", or "implemented")
        const incompleteSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'done' && s.status !== 'implemented');
        debugLog.push(`Incomplete sessions: ${incompleteSessions.length}`);
        incompleteSessions.forEach(s => {
            debugLog.push(`  - ${s.feature_name} (${s.status})`);
        });
        if (incompleteSessions.length === 0) {
            debugLog.push('No incomplete work, exiting');
            await writeDebugLog(projectDir, debugLog);
            return; // No incomplete work
        }
        // Sort by most recent (use last_updated_at or created_at)
        incompleteSessions.sort((a, b) => {
            const aTime = new Date(a.last_updated_at || a.plan_created_at || a.created_at).getTime();
            const bTime = new Date(b.last_updated_at || b.plan_created_at || b.created_at).getTime();
            return bTime - aTime;
        });
        // Show suggestion for the most recent incomplete work
        const mostRecent = incompleteSessions[0];
        const timeAgo = getTimeAgo(mostRecent.last_updated_at || mostRecent.plan_created_at || mostRecent.created_at);
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💡 Unfinished Work Detected');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log(`I see you were working on "${mostRecent.feature_name}" ${timeAgo}.`);
        console.log('');
        console.log('📋 Progress:');
        console.log(`   ${mostRecent.has_spec ? '✅' : '⏳'} Specification`);
        console.log(`   ${mostRecent.has_plan ? '✅' : '⏳'} Technical Plan`);
        console.log(`   ${mostRecent.has_implementation ? '✅' : '⏳'} Implementation`);
        console.log('');
        console.log(`📁 Artifacts: .claude/artifacts/${mostRecent.session_id.substring(0, 8)}...`);
        console.log('');
        if (incompleteSessions.length > 1) {
            console.log(`ℹ️  You have ${incompleteSessions.length} unfinished features total.`);
            console.log('');
        }
        // Suggest next action based on status
        if (mostRecent.status === 'elaborated' && !mostRecent.has_plan) {
            console.log('💬 Ready to continue? Run: /plan');
        }
        else if (mostRecent.status === 'planned' && !mostRecent.has_implementation) {
            console.log('💬 Ready to continue? Run: /implement');
        }
        else {
            console.log('💬 Want to resume? Load the artifacts and continue working.');
        }
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        debugLog.push('✓ Successfully displayed resumption prompt');
        await writeDebugLog(projectDir, debugLog);
    }
    catch (error) {
        debugLog.push(`ERROR: ${error}`);
        await writeDebugLog(projectDir, debugLog);
        // Silently fail - this is just a suggestion
    }
}
async function writeDebugLog(projectDir, logs) {
    try {
        const sessionsDir = path.join(projectDir, '.claude', 'sessions');
        await fs.mkdir(sessionsDir, { recursive: true });
        const logPath = path.join(sessionsDir, 'resumption-debug.log');
        await fs.writeFile(logPath, logs.join('\n') + '\n', 'utf8');
    }
    catch {
        // Even logging fails silently
    }
}
function getTimeAgo(dateString) {
    try {
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffMins < 1)
            return 'just now';
        if (diffMins < 60)
            return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1)
            return 'yesterday';
        if (diffDays < 7)
            return `${diffDays} days ago`;
        if (diffDays < 30)
            return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    }
    catch {
        return 'recently';
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