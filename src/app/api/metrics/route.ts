import { NextRequest } from "next/server";
import { sendSuccess, sendError, withMiddleware } from "@/src/lib/api-helpers";
import { getMetricsSummary } from "@/src/lib/metrics";

async function handleGET(_request: NextRequest) {
  try {
    const summary = await getMetricsSummary();

    return sendSuccess(summary);
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "Metrics unavailable";

    return sendError(
      "Metrics unavailable",
      500,
      { metrics: [details] }
    );
  }
}

const GET = withMiddleware(async (request: NextRequest) => {
  return handleGET(request);
});

export { GET };