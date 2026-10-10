import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = process.env.HOST;
const port = Number(process.env.PORT);

if (!host) {
  throw new Error("HOST is required");
}
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const clientRoot = fileURLToPath(new URL("./dist/", import.meta.url));
const clientRootPrefix = clientRoot.endsWith(sep) ? clientRoot : `${clientRoot}${sep}`;
const indexPath = resolve(clientRoot, "index.html");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function send(response, status, body, contentType) {
  response.writeHead(status, {
    "content-type": contentType,
    "x-content-type-options": "nosniff",
  });
  response.end(body);
}

function isInsideClientRoot(path) {
  return path === clientRoot || path.startsWith(clientRootPrefix);
}

async function existingFile(path) {
  try {
    const details = await stat(path);
    return details.isFile() ? path : null;
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      return null;
    }
    throw error;
  }
}

async function resolveClientFile(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decodedPath.replace(/^\/+/, "") || "index.html";
  const candidate = resolve(clientRoot, relativePath);
  if (!isInsideClientRoot(candidate)) {
    return null;
  }

  const file = await existingFile(candidate);
  if (file) {
    return file;
  }

  return extname(decodedPath) ? null : existingFile(indexPath);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://qwenwork.local");

    if (url.pathname === "/api/health") {
      send(
        response,
        200,
        JSON.stringify({ status: "ok" }),
        "application/json; charset=utf-8",
      );
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("allow", "GET, HEAD");
      send(response, 405, "Method Not Allowed", "text/plain; charset=utf-8");
      return;
    }

    const file = await resolveClientFile(url.pathname);
    if (!file) {
      send(response, 404, "Not Found", "text/plain; charset=utf-8");
      return;
    }

    const body = request.method === "HEAD" ? undefined : await readFile(file);
    send(
      response,
      200,
      body,
      contentTypes.get(extname(file).toLowerCase()) ?? "application/octet-stream",
    );
  } catch (error) {
    console.error("Request failed", error);
    send(response, 500, "Internal Server Error", "text/plain; charset=utf-8");
  }
});

server.listen(port, host, () => {
  console.log(`QW Page server listening on http://${host}:${port}`);
});
