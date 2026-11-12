import type { TransitFileUpload } from "../../core/types.ts";
import type { FileUrlSigner, FileUrlVerification } from "../files/file-url-signing.ts";
import type { ITransitFileService } from "../files/transit-file-store.ts";
import type { Context } from "hono";

import { Hono } from "hono";
import { TransitFileError } from "../files/transit-file-store.ts";
import { jsonError } from "./http-utils.ts";

export interface TransitFileRoutesOptions {
  transitFiles: ITransitFileService;
  /** When set, `GET /files/:fileId` requires the `exp` and `sig` query parameters the signer issued. */
  fileUrlSigner?: FileUrlSigner;
  uploadTransitFile?: (request: Request) => Promise<TransitFileUpload>;
}

interface SignatureError {
  code: string;
  message: string;
}

const signatureErrors: Record<Exclude<FileUrlVerification, "ok">, SignatureError> = {
  missing: { code: "file_signature_required", message: "Transit file URL must carry exp and sig." },
  invalid: { code: "file_signature_invalid", message: "Transit file URL signature is invalid." },
  expired: { code: "file_url_expired", message: "Transit file URL has expired." },
};

function handleTransitFileError(context: Context, error: unknown): Response {
  if (error instanceof TransitFileError) {
    return jsonError(context, error.status, error.code, error.message);
  }
  throw error;
}

/** Transit file upload, retrieval and deletion routes. */
export function createTransitFileRoutes({
  transitFiles,
  fileUrlSigner,
  uploadTransitFile,
}: TransitFileRoutesOptions): Hono {
  const app = new Hono();

  app.post("/files", async (context) => {
    try {
      if (uploadTransitFile) {
        return context.json(await uploadTransitFile(context.req.raw));
      }

      const form = await context.req.raw.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return jsonError(context, 400, "invalid_input", "file is required.");
      }
      const upload = await transitFiles.create(file);
      return context.json(upload);
    } catch (error) {
      return handleTransitFileError(context, error);
    }
  });

  app.get("/files/:fileId", async (context) => {
    try {
      const fileId = context.req.param("fileId");
      if (fileUrlSigner) {
        const verification = await fileUrlSigner.verify(fileId, context.req.query("exp"), context.req.query("sig"));
        if (verification !== "ok") {
          const { code, message } = signatureErrors[verification];
          return jsonError(context, 403, code, message);
        }
      }
      return await transitFiles.response(fileId);
    } catch (error) {
      return handleTransitFileError(context, error);
    }
  });

  app.delete("/files/:fileId", async (context) => {
    try {
      const fileId = context.req.param("fileId");
      const deleted = await transitFiles.delete(fileId);
      return context.json({ fileId, deleted });
    } catch (error) {
      return handleTransitFileError(context, error);
    }
  });

  return app;
}
