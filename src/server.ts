import http from "http";
import fs from "fs";
import path from "path";
import { initializeAgent } from "./my_agent";
import { HumanMessage } from "@langchain/core/messages";

const PORT = parseInt(process.env.PORT || "3000");
const publicDir = path.join(__dirname, "..", "public");

// Initialize the agent once at startup
const agentPromise = initializeAgent();

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const indexPath = path.join(publicDir, "index.html");
    fs.readFile(indexPath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        return res.end("Error loading page");
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(data);
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      try {
        const { message } = JSON.parse(body);
        if (!message) {
          res.statusCode = 400;
          return res.end("Message required");
        }

        const { agent, config } = await agentPromise;
        res.writeHead(200, {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        });

        const stream = await agent.stream(
          { messages: [new HumanMessage(message)] },
          config
        );

        for await (const chunk of stream) {
          let text = "";
          if ("agent" in chunk) {
            text = chunk.agent.messages[0].content;
          } else if ("tools" in chunk) {
            text = chunk.tools.messages[0].content;
          }
          res.write(text);
        }
        res.end();
      } catch (err) {
        res.statusCode = 500;
        res.end("Server error");
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

