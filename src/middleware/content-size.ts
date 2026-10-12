import type { NextFunction, Request, Response } from "express";

export function contentSizeLimit() {
  return (req: Request, res: Response, next: NextFunction) => {
    const limit = 10 * 1024 * 1024; // 10 MB
    const contentLength = req.headers["content-length"];
    if (contentLength && parseInt(contentLength, 10) > limit) {
      res.status(413).send("Content Too Large");
      return;
    }
    next();
  };
}
