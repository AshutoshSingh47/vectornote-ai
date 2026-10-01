import type { Request, Response } from "express";
import { pipeTextStreamToResponse } from "ai";
import { answerQuestionStream } from "../services/ask.service";

export async function ask(req: Request, res: Response) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }

    const result = await answerQuestionStream(query.trim());

    // Body is a plain text stream, so sources ride along as a header instead.
    res.setHeader(
      "X-Sources",
      encodeURIComponent(JSON.stringify(result.sources)),
    );
    res.setHeader("Access-Control-Expose-Headers", "X-Sources");

    if (result.cached) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).end(result.answer);
    }

    await pipeTextStreamToResponse({
      response: res,
      stream: result.textStream,
    });
  } catch (error) {
    console.error("Failed to answer question:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, message: "Failed to answer question" });
    } else {
      res.end();
    }
  }
}
