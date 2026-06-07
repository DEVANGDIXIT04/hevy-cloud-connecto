import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const HEVY_API_KEY = process.env.HEVY_API_KEY;

if (!HEVY_API_KEY) {
  console.warn("WARNING: No HEVY_API_KEY environment variable set in the cloud. Hevy API calls will fail until set.");
}

function createMcpServer() {
  const server = new McpServer({
    name: "hevy-cloud",
    version: "1.0.0",
  });

  // --- HEVY TOOLS ---
  server.tool(
  "create_routine",
  "Create a new workout routine",
  {
    title: z.string().describe("The name of the routine"),
    exercises: z.array(z.object({
      exercise_template_id: z.string().describe("The unique ID of the exercise template"),
      sets: z.array(z.object({
        type: z.enum(["warmup", "normal", "failure", "drop"]),
        weight_kg: z.number().optional(),
        reps: z.number().optional()
      }))
    })).describe("List of exercises to include in the routine"),
    folder_id: z.number().optional().describe("Optional folder ID to put the routine in"),
    notes: z.string().optional().describe("Optional notes for the routine")
  },
  async (args) => {
    try {
      const response = await fetch("https://api.hevyapp.com/v1/routines", {
        method: "POST",
        headers: {
          "api-key": HEVY_API_KEY as string,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ routine: { ...args, folder_id: args.folder_id ?? null } })
      });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${await response.text()}`);
      return { content: [{ type: "text", text: `Successfully created routine: ${JSON.stringify(await response.json())}` }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Failed to create routine: ${err.message}` }], isError: true };
    }
  }
);

server.tool(
  "update_routine",
  "Update an existing workout routine",
  {
    routine_id: z.string().describe("The ID of the routine to update"),
    title: z.string().describe("The new name of the routine"),
    exercises: z.array(z.object({
      exercise_template_id: z.string(),
      sets: z.array(z.object({
        type: z.enum(["warmup", "normal", "failure", "drop"]),
        weight_kg: z.number().optional(),
        reps: z.number().optional()
      }))
    })),
    notes: z.string().optional()
  },
  async (args) => {
    try {
      const { routine_id, ...bodyData } = args;
      const response = await fetch(`https://api.hevyapp.com/v1/routines/${routine_id}`, {
        method: "PUT",
        headers: {
          "api-key": HEVY_API_KEY as string,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ routine: bodyData })
      });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${await response.text()}`);
      return { content: [{ type: "text", text: `Successfully updated routine: ${JSON.stringify(await response.json())}` }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Failed to update routine: ${err.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_recent_workouts",
  "Fetch the user's recent workouts.",
  {},
  async () => {
    try {
      const response = await fetch("https://api.hevyapp.com/v1/workouts?page=1&pageSize=10", {
        headers: { "api-key": HEVY_API_KEY as string }
      });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${await response.text()}`);
      return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Failed to get workouts: ${err.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_routines",
  "Fetch the user's saved routines.",
  {},
  async () => {
    try {
      const response = await fetch("https://api.hevyapp.com/v1/routines?page=1&pageSize=10", {
        headers: { "api-key": HEVY_API_KEY as string }
      });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${await response.text()}`);
      return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Failed to get routines: ${err.message}` }], isError: true };
    }
  }
);

return server;
}

// --- EXPRESS SERVER ---
const app = express();
app.use(cors());

// Fake OAuth Endpoints
app.get("/authorize", (req, res) => {
  const { redirect_uri, state } = req.query;
  console.log("OAuth flow started by Claude, redirecting back...");
  
  if (!redirect_uri) {
    return res.status(400).send("Missing redirect_uri");
  }

  // Redirect back to Claude with a dummy auth code
  res.redirect(`${redirect_uri}?code=dummy_code_123&state=${state}`);
});

app.post("/token", (req, res) => {
  console.log("Claude requested token exchange. Sending fake tokens...");
  res.json({
    access_token: "dummy_access_token_456",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "dummy_refresh_token_789"
  });
});

// Middleware to check fake auth on actual endpoints
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer dummy_access_token")) {
    // In strict mode, we'd block this, but Claude will always send our dummy token now.
    console.warn("Warning: Missing or invalid dummy auth token");
  }
  next();
};

// SSE Transport Endpoint
let transport: SSEServerTransport;

app.get("/sse", requireAuth, async (req, res) => {
  console.log("New SSE connection established by Claude");
  transport = new SSEServerTransport("/messages", res);
  const server = createMcpServer();
  await server.connect(transport);
});

// Message Routing Endpoint
app.post("/messages", requireAuth, async (req, res) => {
  if (!transport) {
    return res.status(500).send("No active SSE transport found");
  }
  await transport.handlePostMessage(req, res);
});

// Health check endpoint for Cloud Host (Render/Vercel)
app.get("/health", (req, res) => res.send("OK"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cloud MCP Server running on port ${PORT}`);
});
