import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const HEVY_API_KEY = process.env.HEVY_API_KEY;
if (!HEVY_API_KEY) {
    console.warn("WARNING: No HEVY_API_KEY environment variable set. Hevy API calls may fail.");
}
// Initialize MCP Server
const server = new McpServer({
    name: "hevy-desktop-connector",
    version: "1.0.0"
});
// Helper function to fetch from Hevy
async function fetchHevy(endpoint, method = "GET", body) {
    const options = {
        method,
        headers: {
            "x-api-key": HEVY_API_KEY || "",
            "Content-Type": "application/json"
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`https://api.hevyapp.com/v1${endpoint}`, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hevy API Error (${response.status}): ${errorText}`);
    }
    return await response.json();
}
// Tool 1: Get Recent Workouts
server.tool("get_recent_workouts", "Fetches the user's most recent Hevy workouts", { limit: z.number().default(5).describe("Number of workouts to fetch") }, async ({ limit }) => {
    try {
        const data = await fetchHevy(`/workouts?limit=${limit}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
    catch (error) {
        return { content: [{ type: "text", text: error.message }], isError: true };
    }
});
// Tool 2: Get Routines
server.tool("get_routines", "Fetches the user's saved workout routines", {}, async () => {
    try {
        const data = await fetchHevy("/routines");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
    catch (error) {
        return { content: [{ type: "text", text: error.message }], isError: true };
    }
});
// Tool 3: Create Routine
server.tool("create_routine", "Creates a new workout routine in Hevy. Provide title, notes, and exercises array.", {
    routine_payload: z.any().describe("The JSON payload for the routine, including title and exercises array.")
}, async ({ routine_payload }) => {
    try {
        const data = await fetchHevy("/routines", "POST", routine_payload);
        return { content: [{ type: "text", text: `Routine Created!\n${JSON.stringify(data, null, 2)}` }] };
    }
    catch (error) {
        return { content: [{ type: "text", text: error.message }], isError: true };
    }
});
// Tool 4: Update Routine
server.tool("update_routine", "Updates an existing workout routine in Hevy. Provide the routine id and the updated payload.", {
    routine_id: z.string().describe("The ID of the routine to update"),
    routine_payload: z.any().describe("The updated JSON payload for the routine.")
}, async ({ routine_id, routine_payload }) => {
    try {
        const data = await fetchHevy(`/routines/${routine_id}`, "PUT", routine_payload);
        return { content: [{ type: "text", text: `Routine Updated!\n${JSON.stringify(data, null, 2)}` }] };
    }
    catch (error) {
        return { content: [{ type: "text", text: error.message }], isError: true };
    }
});
// Connect using Stdio Transport
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 Hevy MCP Local Server running on stdio");
}
run().catch(console.error);
//# sourceMappingURL=index.js.map