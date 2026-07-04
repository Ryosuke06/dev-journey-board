import { describe, expect, test } from 'vitest';
import { err, isErr, isOk, ok, type Result } from './result';

describe('Result', () => {
  test('成功値を例外ではなく値として返す', () => {
    const result: Result<{ readonly id: string }, never> = ok({ id: 'evt-1' });

    expect(result).toEqual({ ok: true, value: { id: 'evt-1' } });
    expect(isOk(result)).toBe(true);

    if (!isOk(result)) {
      throw new Error('expected ok result');
    }

    expect(result.value.id).toBe('evt-1');
  });

  test('失敗理由を呼び出し元が分岐できる形で返す', () => {
    const result: Result<never, { readonly code: 'write_failed'; readonly message: string }> = err({
      code: 'write_failed',
      message: '写真を保存できませんでした'
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'write_failed',
        message: '写真を保存できませんでした'
      }
    });
    expect(isErr(result)).toBe(true);

    if (!isErr(result)) {
      throw new Error('expected err result');
    }

    expect(result.error.code).toBe('write_failed');
  });
});
