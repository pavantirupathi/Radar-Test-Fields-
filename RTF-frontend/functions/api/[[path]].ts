interface PagesEnvironment {
  API_ORIGIN?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: PagesEnvironment;
}

export async function onRequest({ request, env }: PagesFunctionContext): Promise<Response> {
  const configuredOrigin = env.API_ORIGIN?.trim();
  if (!configuredOrigin) {
    return Response.json({ message: "The API proxy is not configured." }, { status: 503 });
  }

  let apiOrigin: URL;
  try {
    apiOrigin = new URL(configuredOrigin);
  } catch {
    return Response.json({ message: "The API proxy must be configured with an HTTPS origin." }, { status: 500 });
  }

  if (
    apiOrigin.protocol !== "https:" ||
    apiOrigin.username ||
    apiOrigin.password ||
    apiOrigin.pathname !== "/" ||
    apiOrigin.search ||
    apiOrigin.hash
  ) {
    return Response.json({ message: "The API proxy must be configured with an HTTPS origin." }, { status: 500 });
  }

  const destination = new URL(request.url);
  destination.protocol = apiOrigin.protocol;
  destination.host = apiOrigin.host;
  return fetch(new Request(destination, request));
}
