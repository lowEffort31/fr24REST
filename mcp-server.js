/**
 * LIFT MCP Server v2
 * Simple bridge for Claude Desktop using native fetch
 */
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const API_BASE_URL = "http://localhost:3000/api";

const server = new Server(
  { name: "lift-v2", version: "2.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_flight",
      description: "Flight status + Intelligence (Delays/Risks)",
      inputSchema: {
        type: "object",
        properties: { code: { type: "string" } },
        required: ["code"]
      }
    },
    {
      name: "get_airport",
      description: "Airport Operations + Weather Impact + Turnarounds",
      inputSchema: {
        type: "object",
        properties: { 
            code: { type: "string" },
            registration: { type: "string", description: "Filter for specific turnaround" }
        },
        required: ["code"]
      }
    },
    {
      name: "nearby_scan",
      description: "Nearby aircraft + Distance + Approach status",
      inputSchema: {
        type: "object",
        properties: { 
            lat: { type: "number" }, 
            lon: { type: "number" },
            radius: { type: "number", default: 50 }
        },
        required: ["lat", "lon"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let url = "";
  
  if (name === "get_flight") url = `${API_BASE_URL}/flight/${args.code}`;
  else if (name === "get_airport") url = `${API_BASE_URL}/airports/${args.code}?weather=true&schedule=true${args.registration ? `&registration=${args.registration}` : ''}`;
  else if (name === "nearby_scan") url = `${API_BASE_URL}/nearby?lat=${args.lat}&lon=${args.lon}&radius=${args.radius || 50}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data.data || data, null, 2) }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
