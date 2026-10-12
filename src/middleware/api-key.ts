import type { NextFunction, Request, Response } from "express";
import { createHash, timingSafeEqual } from "node:crypto";

// openssl rand -base64 32 zum Erzeugen eines APi Keys
export function getApiKeyMiddleware(expectedKey: string) {
  return function apiKeyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const token = getBearerToken(req.headers.authorization);

    if (!token || !isEqual(token, expectedKey)) {
      res.setHeader("WWW-Authenticate", "Bearer");
      res.status(401).send("Unauthorized");
    } else {
      next();
    }
  };
}

function getBearerToken(header?: string | undefined) {
  return header?.match(/^Bearer +(\S+)$/i)?.[1];
}

function isEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
