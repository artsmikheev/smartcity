import { describe, expect, it } from "vitest";
import { resolveMediaUrl } from "../lib/storage";

describe("resolveMediaUrl", () => {
  it.each([null, undefined, "", " ", "\t\n"])(
    "returns null for an empty input: %s",
    (path) => {
      expect(resolveMediaUrl(path)).toBeNull();
    },
  );

  it.each([
    "http://example.com/image.jpg",
    "https://example.com/image.jpg",
    "https://example.com/image%20one.jpg?token=a%2Fb&width=640#preview",
    "http://localhost:8081/image.jpg",
    "HTTPS://example.com/image.jpg",
  ])("preserves an HTTP(S) URL unchanged: %s", (path) => {
    expect(resolveMediaUrl(path)).toBe(path);
  });

  it.each([
    "ftp://example.com/image.jpg",
    "file:///tmp/image.jpg",
    "content://media/image/1",
    "data:image/png;base64,AAAA",
    "javascript:alert(1)",
    "//example.com/image.jpg",
    "apartments/image.jpg",
    "storage/v1/object/public/apartments/image.jpg",
    "/storage/v1/object/public/apartments/image.jpg",
    "reutov-urban-day-concept.jpg",
    "assets/images/reutov-urban-day-concept.jpg",
    "http://",
    "https://",
    "https://?image.jpg",
    "https://example.com/image one.jpg",
    " https://example.com/image.jpg ",
  ])("rejects unsupported or malformed media paths: %s", (path) => {
    expect(resolveMediaUrl(path)).toBeNull();
  });

  it.each([
    "asset://",
    "asset://missing.jpg",
    "asset://images/missing.jpg",
    "asset://assets/images/missing.jpg",
    "asset://__proto__",
    "asset://constructor",
    "asset://toString",
    "asset://../reutov-urban-day-concept.jpg",
    "asset://other/reutov-urban-day-concept.jpg",
    "asset://reutov-urban-day-concept.jpg?width=640",
  ])("returns null for an unknown asset key: %s", (path) => {
    expect(resolveMediaUrl(path)).toBeNull();
  });

  // Known JPGs are exercised in Expo, where Metro supplies asset module IDs.
});
