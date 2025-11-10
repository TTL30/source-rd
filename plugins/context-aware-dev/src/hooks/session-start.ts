#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

type SessionMatcher = 'startup' | 'resume' | 'clear' | 'compact';

async function handleSessionStart(
  sessionId: string,
  matcher: SessionMatcher,
  projectDir: string
): Promise<void> {
  try {
    console.log(`[Context-Aware Plugin] Session ${sessionId} started (${matcher})`);

    // Ensure .claude directory exists
    const claudeDir = path.join(projectDir, '.claude');
    await fs.mkdir(claudeDir, { recursive: true });

    // Ensure artifacts directory exists
    const artifactsDir = path.join(claudeDir, 'artifacts');
    await fs.mkdir(artifactsDir, { recursive: true });

    // Create session-specific artifact directory
    const sessionArtifactsDir = path.join(artifactsDir, sessionId);
    await fs.mkdir(sessionArtifactsDir, { recursive: true });

    console.log('[Context-Aware Plugin] ✓ Plugin ready');
    console.log(`[Context-Aware Plugin] Artifact directory: ${sessionArtifactsDir}`);
  } catch (error) {
    console.error('[Context-Aware Plugin] Error during session start:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('[Context-Aware Plugin] Error: Missing required arguments');
  console.error('Usage: session-start.js <session_id> <matcher> <project_dir>');
  process.exit(1);
}

const [sessionId, matcher, projectDir] = args;

// Validate matcher
const validMatchers: SessionMatcher[] = ['startup', 'resume', 'clear', 'compact'];
if (!validMatchers.includes(matcher as SessionMatcher)) {
  console.error(`[Context-Aware Plugin] Error: Invalid matcher "${matcher}". Must be one of: ${validMatchers.join(', ')}`);
  process.exit(1);
}

// Execute handler
handleSessionStart(sessionId, matcher as SessionMatcher, projectDir).catch((error) => {
  console.error('[Context-Aware Plugin] Fatal error:', error);
  process.exit(1);
});
