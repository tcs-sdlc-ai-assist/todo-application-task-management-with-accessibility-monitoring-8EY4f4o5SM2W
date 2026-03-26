import { NextRequest } from "next/server";
import { sendSuccess, sendError, withMiddleware } from "@/src/lib/api-helpers";
import { prisma } from "@/src/lib/db";

const startTime = Date.now();

async function handleGET(_request: NextRequest) {
  const timestamp = new Date().toISOString();
  const uptimeMs = Date.now() - startTime;

  try {
    await prisma.$queryRaw`SELECT 1`;

    return sendSuccess({
      status: "ok",
      uptime: uptimeMs,
      timestamp,
    });
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "Database unreachable";

    return sendError(
      "Service unavailable",
      503,
      { database: [details] }
    );
  }
}

const GET = withMiddleware(async (request: NextRequest) => {
  return handleGET(request);
});

export { GET };