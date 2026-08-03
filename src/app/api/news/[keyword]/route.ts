import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy to the Dataville news API.
 *
 * The browser calls this same-origin route (`/api/news/<keyword>`) instead of
 * hitting `app.dataville.com/news/...` directly. That:
 *   1. avoids the cross-origin (CORS) failure — the Dataville news route does
 *      not send Access-Control-Allow-Origin, so a direct browser call is blocked;
 *   2. lets us attach a Dataville API key server-side (never exposed to the
 *      client), moving the app off the anonymous per-IP rate limit; and
 *   3. gives us an edge-cache point to ease rate limits.
 *
 * The upstream JSON is passed straight through unchanged, so the client parses
 * the exact same response shape it always has.
 */

export const dynamic = 'force-dynamic';

const UPSTREAM_BASE = process.env.DATAVILLE_API_BASE || 'https://app.dataville.com';
const UPSTREAM_TIMEOUT_MS = 15000;

export async function GET(
  _request: NextRequest,
  { params }: { params: { keyword: string } }
) {
  const keyword = params.keyword?.trim();
  if (!keyword) {
    return NextResponse.json(
      { status: 'error', data: { error: 'Keyword is required' } },
      { status: 400 }
    );
  }

  const upstreamUrl = `${UPSTREAM_BASE}/news/${encodeURIComponent(keyword)}`;

  const headers: HeadersInit = { Accept: 'application/json' };
  // Optional: authenticate server-side for the higher (non-anonymous) rate limit.
  const apiKey = process.env.DATAVILLE_API_KEY;
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const res = await fetch(upstreamUrl, { headers, signal: controller.signal });
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        // Briefly cache successful lookups at the edge to ease rate limits.
        'Cache-Control': res.ok
          ? 's-maxage=300, stale-while-revalidate=600'
          : 'no-store',
      },
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json(
      {
        status: 'error',
        data: { error: aborted ? 'Upstream timeout' : 'Upstream fetch failed' },
      },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
