import { describe, it, expect } from "vitest";
import { ok, err, isOk, isErr, type Result } from "./result";

describe("ok", () => {
  it("creates an Ok result with the given value", () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(42);
  });

  it("works with string values", () => {
    const result = ok("hello");
    expect(result.ok).toBe(true);
    expect(result.value).toBe("hello");
  });

  it("works with object values", () => {
    const value = { x: 1 };
    const result = ok(value);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(value);
  });
});

describe("err", () => {
  it("creates an Err result with the given error", () => {
    const result = err("something went wrong");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("something went wrong");
  });

  it("works with Error objects", () => {
    const error = new Error("oops");
    const result = err(error);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(error);
  });

  it("works with numeric error codes", () => {
    const result = err(404);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(404);
  });
});

describe("isOk", () => {
  it("returns true for an Ok result", () => {
    const result: Result<number, string> = ok(1);
    expect(isOk(result)).toBe(true);
  });

  it("returns false for an Err result", () => {
    const result: Result<number, string> = err("fail");
    expect(isOk(result)).toBe(false);
  });

  it("narrows type to Ok when true", () => {
    const result: Result<number, string> = ok(99);
    if (isOk(result)) {
      expect(result.value).toBe(99);
    }
  });
});

describe("isErr", () => {
  it("returns true for an Err result", () => {
    const result: Result<number, string> = err("fail");
    expect(isErr(result)).toBe(true);
  });

  it("returns false for an Ok result", () => {
    const result: Result<number, string> = ok(1);
    expect(isErr(result)).toBe(false);
  });

  it("narrows type to Err when true", () => {
    const result: Result<number, string> = err("something bad");
    if (isErr(result)) {
      expect(result.error).toBe("something bad");
    }
  });
});
