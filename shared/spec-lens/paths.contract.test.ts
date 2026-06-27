import path from 'node:path';
import { describe, expect, test } from 'vitest';

interface SpecLensPathContract {
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

interface PathContractModule {
  createSpecLensPaths(input: { projectRoot: string; specName: string }): SpecLensPathContract;
  ensureInsideProjectRoot(input: {
    projectRoot: string;
    candidatePath: string;
  }): { ok: true; path: string } | { ok: false; reason: 'outside_project_root' };
}

async function loadPathContract(): Promise<PathContractModule> {
  const modulePath = './paths';

  return import(/* @vite-ignore */ modulePath) as Promise<PathContractModule>;
}

describe('SpecLens path contract', () => {
  const projectRoot = path.resolve('/workspace/dev-journey-board');
  const specName = 'spec-lens-timeline';

  test.fails('仕様文書、実行時データ、発表用固定データの保存先を分離する', async () => {
    const { createSpecLensPaths } = await loadPathContract();

    const paths = createSpecLensPaths({ projectRoot, specName });

    expect(paths.projectMemoryRoot).toBe(
      path.join(projectRoot, '.kiro', 'specs', 'spec-lens-timeline')
    );
    expect(paths.runtimeRoot).toBe(path.join(projectRoot, '.spec-lens'));
    expect(paths.demoDataRoot).toBe(path.join(projectRoot, 'demo-data', 'spec-lens'));
  });

  test.fails('仕様MarkdownはProject Memory配下に置き、生成ログや画像を混ぜない', async () => {
    const { createSpecLensPaths } = await loadPathContract();

    const paths = createSpecLensPaths({ projectRoot, specName });

    expect(paths.requirementsFile).toBe(path.join(paths.projectMemoryRoot, 'requirements.md'));
    expect(paths.designFile).toBe(path.join(paths.projectMemoryRoot, 'design.md'));
    expect(paths.tasksFile).toBe(path.join(paths.projectMemoryRoot, 'tasks.md'));
    expect(paths.eventLogFile).not.toContain(`${path.sep}.kiro${path.sep}specs${path.sep}`);
    expect(paths.screenshotsRoot).not.toContain(`${path.sep}.kiro${path.sep}specs${path.sep}`);
    expect(paths.reportsRoot).not.toContain(`${path.sep}.kiro${path.sep}specs${path.sep}`);
  });

  test.fails('実行時生成物は.spec-lens配下、デモ生成物はdemo-data/spec-lens配下に閉じ込める', async () => {
    const { createSpecLensPaths } = await loadPathContract();

    const paths = createSpecLensPaths({ projectRoot, specName });

    expect(paths.eventLogFile).toBe(path.join(paths.runtimeRoot, 'events.ndjson'));
    expect(paths.screenshotsRoot).toBe(path.join(paths.runtimeRoot, 'screenshots'));
    expect(paths.snapshotsRoot).toBe(path.join(paths.runtimeRoot, 'snapshots'));
    expect(paths.reportsRoot).toBe(path.join(paths.runtimeRoot, 'reports'));
    expect(paths.demoEventsFile).toBe(path.join(paths.demoDataRoot, 'events.sample.ndjson'));
    expect(paths.demoScreenshotsRoot).toBe(path.join(paths.demoDataRoot, 'screenshots'));
  });

  test.fails('project root外の保存先と外部URLを拒否する', async () => {
    const { createSpecLensPaths, ensureInsideProjectRoot } = await loadPathContract();

    const paths = createSpecLensPaths({ projectRoot, specName });
    const outsideProject = ensureInsideProjectRoot({
      projectRoot,
      candidatePath: path.resolve(projectRoot, '..', 'outside', 'events.ndjson')
    });

    expect(outsideProject).toEqual({ ok: false, reason: 'outside_project_root' });
    expect(Object.values(paths)).not.toContain('https://example.com/spec-lens/events.ndjson');
    expect(Object.values(paths).every((value) => !/^https?:\/\//.test(value))).toBe(true);
  });
});
