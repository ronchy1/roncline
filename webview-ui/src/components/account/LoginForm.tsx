import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { UpdateMcpHeadersRequest } from "@shared/proto/mcp"

interface ApiConfiguration {
	clineApiKey?: string
	anthropicApiKey?: string
	openAiApiKey?: string
	openRouterApiKey?: string
	awsAccessKeyId?: string
	awsSecretAccessKey?: string
	awsRegion?: string
	awsProfile?: string
	googleApiKey?: string
	googleProjectId?: string
	googleRegion?: string
	model?: string
	planModel?: string
	actModel?: string
	planActSeparateModels?: boolean
	enableCheckpoints?: boolean
	mcpMarketplaceEnabled?: boolean
	mcpRichDisplayEnabled?: boolean
	mcpResponsesCollapsed?: boolean
}

interface LoginFormProps {
	onLoginSuccess: (accessToken: string) => void
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
	const { authEndpoint, formLoginClicked, updateMcpHeaders } = useExtensionState()
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError("")

		try {
			if (!authEndpoint) {
				throw new Error("Authentication endpoint not configured")
			}
			const { accessToken } = await formLoginClicked({
				authEndpoint,
				username,
				password,
			})

			// Update MCP headers with the token
			await updateMcpHeaders({
				key: "X-Octopus-Token",
				value: accessToken,
			})

			setSuccess("Login Succeeded")

			// Call success handler
			onLoginSuccess(accessToken)
		} catch (err) {
			setSuccess("")
			const message = err instanceof Error ? err.message : "Login failed"
			setError(
				message.includes("Failed to fetch") ? "Network error - please check your connection and auth endpoint" : message,
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="w-full">
			<div className="mb-4">
				<VSCodeTextField
					value={username}
					onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
					placeholder="Username"
					required
					className="w-full"
				/>
			</div>
			<div className="mb-4">
				<VSCodeTextField
					type="password"
					value={password}
					onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
					placeholder="Password"
					required
					className="w-full"
				/>
			</div>
			{success && (
				<div className="text-[var(--vscode-gitDecoration-addedResourceForeground)] mb-4 text-sm">
					{success} - Using authentication endpoint: {authEndpoint}
				</div>
			)}
			{error && <div className="text-[var(--vscode-errorForeground)] mb-4">{error}</div>}
			<VSCodeButton type="submit" disabled={isLoading} className="w-full">
				{isLoading ? "Logging in..." : "Log in"}
			</VSCodeButton>
		</form>
	)
}

export default LoginForm
