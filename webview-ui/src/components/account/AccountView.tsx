import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import ClineLogoWhite from "../../assets/ClineLogoWhite"
import { useExtensionState } from "@/context/ExtensionStateContext"
import LoginForm from "./LoginForm"

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

interface ExtendedApiConfiguration extends ApiConfiguration {
	authEndpoint?: string
}

type AccountViewProps = {
	onDone: () => void
}

const AccountView = ({ onDone }: AccountViewProps) => {
	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden pt-[10px] pl-[20px]">
			<div className="flex justify-between items-center mb-[17px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">Account</h3>
				<VSCodeButton onClick={onDone}>Done</VSCodeButton>
			</div>
			<div className="flex-grow overflow-hidden pr-[8px] flex flex-col">
				<div className="h-full mb-[5px]">
					<ClineAccountView />
				</div>
			</div>
		</div>
	)
}

export const ClineAccountView = () => {
	const { userInfo, apiConfiguration: _apiConfig, accessToken, setAccessToken } = useExtensionState()
	const apiConfiguration = _apiConfig as ExtendedApiConfiguration | undefined
	const user = accessToken ? userInfo : undefined

	const handleLoginSuccess = (token: string) => {
		setAccessToken(token)
	}

	const handleLogout = () => {
		setAccessToken(null)
	}
	return (
		<div className="h-full flex flex-col">
			<div className="flex flex-col items-center pr-3">
				<ClineLogoWhite className="size-16 mb-4" />

				<p style={{}}>Login for accessing privileged tools in MCP server.</p>

				<LoginForm onLoginSuccess={handleLoginSuccess} />
			</div>
		</div>
	)
}

export default memo(AccountView)
