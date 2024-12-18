import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { HumanMessage } from "@langchain/core/messages";
import * as readline from "readline";

dotenv.config();

const WALLET_DATA_FILE = "wallet_data.txt";

async function initializeAgent() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini", // Replace or adjust the model if desired
  });

  let walletDataStr: string | null = null;

  if (fs.existsSync(WALLET_DATA_FILE)) {
    try {
      walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
    } catch (error) {
      console.error("Error reading wallet data:", error);
    }
  }

  const config = {
    cdpWalletData: walletDataStr || undefined,
    networkId: process.env.NETWORK_ID || "base-sepolia",
  };

  const agentkit = await CdpAgentkit.configureWithWallet(config);
  const cdpToolkit = new CdpToolkit(agentkit);
  const tools = cdpToolkit.getTools();

  // Set up memory and config for agent
  const memory = new MemorySaver();
  const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier:
      "You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit...",
  });

  // Save wallet data to disk so that the agent’s wallet is persistent across runs
  const exportedWallet = await agentkit.exportWallet();
  fs.writeFileSync(WALLET_DATA_FILE, exportedWallet);

  return { agent, config: agentConfig };
}

async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  console.log("Starting Agent...");
  initializeAgent()
    .then(({ agent, config }) => runChatMode(agent, config))
    .catch(error => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
