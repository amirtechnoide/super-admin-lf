import type { NextRequest } from "next/server";

/**
 * Relais vers le backend Spring.
 *
 * Le backend renvoie **403 à toute requête portant un en-tête `Origin` qui
 * n'est pas le sien** — vérifié : requête identique, 200 sans `Origin`, 200
 * avec l'origine du backend (le cas de Swagger), 403 avec
 * `http://localhost:3000`. Un simple `rewrite` Next ne suffit pas : il
 * retransmet l'`Origin` du navigateur tel quel. Ce handler le retire, ce qui
 * ramène l'appel à un échange serveur à serveur.
 *
 * À supprimer dès que le CORS du backend acceptera l'origine du dashboard :
 * il suffira alors de pointer `NEXT_PUBLIC_API_BASE_URL` sur l'URL absolue.
 */
const TARGET = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

/** En-têtes propres à l'appel navigateur, à ne pas propager en amont. */
const STRIPPED_REQUEST_HEADERS = [
  "origin",
  "referer",
  "host",
  "connection",
  // Sans cela le backend compresse, et le corps relayé serait illisible.
  "accept-encoding",
];

/** En-têtes de réponse qui décriraient un corps que nous réécrivons. */
const STRIPPED_RESPONSE_HEADERS = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
];

async function forward(request: NextRequest, segments: string[]) {
  if (!TARGET) {
    return Response.json(
      {
        status: 500,
        error: "API_PROXY_TARGET n'est pas défini dans .env.local.",
      },
      { status: 500 }
    );
  }

  const { search } = new URL(request.url);
  const target = `${TARGET}/${segments.join("/")}${search}`;

  const headers = new Headers(request.headers);
  for (const name of STRIPPED_REQUEST_HEADERS) headers.delete(name);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      // Le corps est relayé en flux : indispensable pour les envois multipart
      // (image de couverture, logo) qu'on ne doit surtout pas réencoder.
      body: hasBody ? request.body : undefined,
      redirect: "manual",
      // Requis par Node dès qu'un corps est un flux.
      ...(hasBody ? { duplex: "half" } : {}),
    } as RequestInit);
  } catch (error) {
    return Response.json(
      {
        status: 502,
        error: "Backend injoignable depuis le serveur Next.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const name of STRIPPED_RESPONSE_HEADERS) responseHeaders.delete(name);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type Context = { params: Promise<{ path: string[] }> };

async function handler(request: NextRequest, context: Context) {
  const { path } = await context.params;
  return forward(request, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
