export type Ok<TValue> = {
  readonly ok: true;
  readonly value: TValue;
};

export type Err<TError> = {
  readonly ok: false;
  readonly error: TError;
};

export type Result<TValue, TError> = Ok<TValue> | Err<TError>;

export function ok<TValue>(value: TValue): Ok<TValue> {
  return { ok: true, value };
}

export function err<TError>(error: TError): Err<TError> {
  return { ok: false, error };
}

export function isOk<TValue, TError>(result: Result<TValue, TError>): result is Ok<TValue> {
  return result.ok;
}

export function isErr<TValue, TError>(result: Result<TValue, TError>): result is Err<TError> {
  return !result.ok;
}
