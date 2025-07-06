import { convertMcpServersToProtoMcpServers } from "@/shared/proto-conversions/mcp/mcp-server-conversion"
import { Controller } from ".."
import { UpdateMcpHeadersRequest, McpServers } from "../../../shared/proto/mcp"

/**
 * Updates the headers configuration for an MCP server.
 * @param controller - The Controller instance
 * @param request - Contains server name and headers object
 * @returns Array of updated McpServer objects
 */
export async function updateMcpHeaders(controller: Controller, request: UpdateMcpHeadersRequest): Promise<McpServers> {
	try {
		if (request.serverName && typeof request.serverName === "string" && request.headers) {
			const mcpServers = await controller.mcpHub?.updateServerHeadersRPC(request.serverName, request.headers)
			const convertedMcpServers = convertMcpServersToProtoMcpServers(mcpServers)
			return McpServers.create({ mcpServers: convertedMcpServers })
		} else {
			console.error("Server name and headers are required")
			throw new Error("Server name and headers are required")
		}
	} catch (error) {
		console.error(`Failed to update headers for server ${request.serverName}:`, error)
		throw error
	}
}
