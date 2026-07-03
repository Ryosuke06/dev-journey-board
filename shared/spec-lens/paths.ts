import path from 'node:path';

export interface SpecLensPathContract {
  projectMemoryRoot: string;
  requirementsFile: string;
  designFile: string;
  tasksFile: string;
  runtimeRoot: string;
  eventLogFile: string;
  screenshotsRoot: string;
  snapshotsRoot: string;
  reportsRoot: string;
  demoDataRoot: string;
  demoEventsFile: string;
  demoScreenshotsRoot: string;
}

export type ProjectRootCheckResult =
  | { ok: true; path: string }
  | { ok: false; reason: 'outside_project_root' };

export function createSpecLensPaths(input: {
  projectRoot: string;
  specName: string;
}): SpecLensPathContract {
  const projectRoot = path.resolve(input.projectRoot);
  const projectMemoryRoot = path.join(projectRoot, '.kiro', 'specs', input.specName);
  const runtimeRoot = path.join(projectRoot, '.spec-lens');
  const demoDataRoot = path.join(projectRoot, 'demo-data', 'spec-lens');

  return {
    projectMemoryRoot,
    requirementsFile: path.join(projectMemoryRoot, 'requirements.md'),
    designFile: path.join(projectMemoryRoot, 'design.md'),
    tasksFile: path.join(projectMemoryRoot, 'tasks.md'),
    runtimeRoot,
    eventLogFile: path.join(runtimeRoot, 'events.ndjson'),
    screenshotsRoot: path.join(runtimeRoot, 'screenshots'),
    snapshotsRoot: path.join(runtimeRoot, 'snapshots'),
    reportsRoot: path.join(runtimeRoot, 'reports'),
    demoDataRoot,
    demoEventsFile: path.join(demoDataRoot, 'events.sample.ndjson'),
    demoScreenshotsRoot: path.join(demoDataRoot, 'screenshots')
  };
}

export function ensureInsideProjectRoot(input: {
  projectRoot: string;
  candidatePath: string;
}): ProjectRootCheckResult {
  if (/^https?:\/\//i.test(input.candidatePath)) {
    return { ok: false, reason: 'outside_project_root' };
  }

  const projectRoot = path.resolve(input.projectRoot);
  const candidatePath = path.resolve(input.candidatePath);
  const relativePath = path.relative(projectRoot, candidatePath);
  const isInsideProject =
    relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));

  if (!isInsideProject) {
    return { ok: false, reason: 'outside_project_root' };
  }

  return { ok: true, path: candidatePath };
}
