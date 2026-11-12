import { describe, expect, it } from "vitest";
import { createFileUrlSigner } from "./file-url-signing.ts";

describe("createFileUrlSigner", () => {
  it("verifies its own signature until exp", async () => {
    const s = createFileUrlSigner("secret", 300);
    const { exp, sig } = await s.sign("a".repeat(32), 1_000_000);
    expect(await s.verify("a".repeat(32), String(exp), sig, 1_000_000 + 299_000)).toBe("ok");
    expect(await s.verify("a".repeat(32), String(exp), sig, 1_000_000 + 301_000)).toBe("expired");
  });

  it("rejects a signature for another file or an edited exp", async () => {
    const s = createFileUrlSigner("secret", 300);
    const { exp, sig } = await s.sign("a".repeat(32), 0);
    expect(await s.verify("b".repeat(32), String(exp), sig, 0)).toBe("invalid");
    expect(await s.verify("a".repeat(32), String(exp + 600), sig, 0)).toBe("invalid");
  });

  it("reports a missing signature", async () => {
    expect(await createFileUrlSigner("s", 300).verify("a".repeat(32), undefined, undefined)).toBe("missing");
  });

  it("rejects a signature made with another secret or a malformed exp", async () => {
    const { exp, sig } = await createFileUrlSigner("other", 300).sign("a".repeat(32), 0);
    const s = createFileUrlSigner("secret", 300);
    expect(await s.verify("a".repeat(32), String(exp), sig, 0)).toBe("invalid");
    expect(await s.verify("a".repeat(32), "soon", sig, 0)).toBe("invalid");
  });
});
