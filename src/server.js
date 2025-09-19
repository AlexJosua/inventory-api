import http from "http";
import url from "url";
import { StringDecoder } from "string_decoder";
import { router as inventoryRouter } from "./route/api.js";
import { customerRouter } from "./route/customerApi.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (chunk) => {
    buffer += decoder.write(chunk);
  });

  req.on("end", async () => {
    buffer += decoder.end();
    let body = {};
    try {
      if (buffer) body = JSON.parse(buffer);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid JSON body" }));
    }

    // cek apakah endpoint milik customerRouter
    if (parsedUrl.pathname.startsWith("/customers")) {
      return customerRouter(req, res, parsedUrl, body); // ✅ kirim parsedUrl & body
    }

    // kalau bukan, lempar ke inventory router
    inventoryRouter(req, res, parsedUrl, body);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});
