#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

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

interface ChangeTracker {
  changes: Array<{
    type: string;
    file: string;
    timestamp: string;
  }>;
  last_suggestion?: string;
}

async function handlePostToolUse(input: PostToolUseInput): Promise<void> {
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
    } catch {
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
  } catch (error) {
    // Silently fail - don't block Claude Code execution
  }
}

function detectSignificantChange(filePath: string): string | null {
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

async function trackChange(projectDir: string, changeType: string, filePath: string): Promise<void> {
  try {
    const claudeDir = path.join(projectDir, '.claude');
    const sessionsDir = path.join(claudeDir, 'sessions');
    await fs.mkdir(sessionsDir, { recursive: true });

    const changesPath = path.join(sessionsDir, 'changes.json');

    // Load existing changes
    let tracker: ChangeTracker = { changes: [] };
    try {
      const content = await fs.readFile(changesPath, 'utf8');
      tracker = JSON.parse(content);
    } catch {
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
  } catch {
    // Silently fail
  }
}

async function checkAndSuggestRefresh(projectDir: string): Promise<void> {
  try {
    const changesPath = path.join(projectDir, '.claude', 'sessions', 'changes.json');

    // Load tracker
    const content = await fs.readFile(changesPath, 'utf8');
    const tracker: ChangeTracker = JSON.parse(content);

    // Count recent changes (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentChanges = tracker.changes.filter(c =>
      new Date(c.timestamp) > oneDayAgo
    );

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
      }, {} as Record<string, number>);

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
  } catch {
    // Silently fail
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
