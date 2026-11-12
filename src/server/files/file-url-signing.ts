import { constantTimeEqual } from "../api/auth-utils.ts";

/** The query parameters that make a transit file download URL valid until `exp` (unix seconds). */
export interface FileUrlSignature {
  exp: number;
  sig: string;
}

export type FileUrlVerification = "ok" | "missing" | "expired" | "invalid";

/** Signs transit file download URLs so `GET /api/files/:fileId` stays public without being guessable forever. */
export interface FileUrlSigner {
  sign(fileId: string, nowMs?: number): Promise<FileUrlSignature>;
  verify(
    fileId: string,
    exp: string | undefined,
    sig: string | undefined,
    nowMs?: number,
  ): Promise<FileUrlVerification>;
}

/** HMAC-SHA256 over `${fileId}.${exp}` with `secret`; a signature lives `ttlSeconds`. */
export function createFileUrlSigner(secret: string, ttlSeconds: number): FileUrlSigner {
  const key = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = async (fileId: string, exp: number): Promise<string> => {
    const mac = await crypto.subtle.sign("HMAC", await key, new TextEncoder().encode(`${fileId}.${exp}`));
    return Buffer.from(mac).toString("base64url");
  };

  return {
    async sign(fileId, nowMs = Date.now()) {
      const exp = Math.floor(nowMs / 1000) + ttlSeconds;
      return { exp, sig: await signature(fileId, exp) };
    },
    async verify(fileId, exp, sig, nowMs = Date.now()) {
      if (!exp || !sig) return "missing";
      if (!/^\d{1,15}$/.test(exp)) return "invalid";
      const expSeconds = Number(exp);
      // Check the MAC before the clock so an edited exp reports as tampering, not as expiry.
      if (!constantTimeEqual(sig, await signature(fileId, expSeconds))) return "invalid";
      return nowMs >= expSeconds * 1000 ? "expired" : "ok";
    },
  };
}
