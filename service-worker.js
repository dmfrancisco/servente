import getMimeType from "./mimetypes.js";
import fileIgnoreList from "./fileignore.js";

self.addEventListener("install", (event) => {
  console.info("[servente-sw] SW installing…");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.info("[servente-sw] SW ready to serve files.");
  event.waitUntil(clients.claim());
});

self.fileHandles = {};

async function listFiles(directoryHandle, pathPrefix = "") {
  let files = {};

  for await (const handle of directoryHandle.values()) {
    const { name, kind } = handle;
    if (fileIgnoreList.includes(name)) continue;

    const path = `${pathPrefix}/${name}`;

    if (kind === "directory") {
      const moreFiles = await listFiles(handle, path);
      files = { ...files, ...moreFiles };
    } else {
      files[path] = handle;
    }
  }
  return files;
}

self.addEventListener("message", async (event) => {
  const { directoryHandle } = event.data;
  if (!directoryHandle) return;

  console.info("[servente-sw] Received new directory handle.");
  self.fileHandles = await listFiles(directoryHandle);

  console.info("[servente-sw] List of files in directory:", Object.keys(self.fileHandles));
  event.source.postMessage({ completed: true });
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  console.info("[servente-sw] Received GET fetch request.");

  const url = new URL(event.request.url);
  if (url.host !== self.location.host) return;

  const path = url.pathname + (url.pathname.endsWith("/") ? "index.html" : "");
  const fileHandle = self.fileHandles[path] || self.fileHandles[`${path}/index.html`];
  if (!fileHandle) return console.info("[servente-sw] Didn't find file handle for:", path);

  const eventHandler = async function () {
    const file = await fileHandle.getFile();
    const fileReader = new FileReader();
    const mimeType = getMimeType(path);

    const loaded = new Promise((resolve, reject) => {
      fileReader.onload = () => resolve();
      fileReader.onerror = () => reject(Error("[servente-sw] File loading error"));
    });

    fileReader.readAsArrayBuffer(file);
    await loaded;

    const fileData = fileReader.result;
    return new Response(fileData, { headers: { "Content-Type": mimeType } });
  };

  event.respondWith(eventHandler());
});
