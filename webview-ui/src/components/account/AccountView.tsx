import { VSCodeButton, VSCodeDivider, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import VSCodeButtonLink from "../common/VSCodeButtonLink"
import ClineLogoWhite from "../../assets/ClineLogoWhite"
import CountUp from "react-countup"
import CreditsHistoryTable from "./CreditsHistoryTable"
import { UsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
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

	const [balance, setBalance] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [usageData, setUsageData] = useState<UsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])

	// Fetch all account data when component mounts
	useEffect(() => {
		if (user && accessToken && apiConfiguration?.authEndpoint) {
			setIsLoading(true)
			fetch(`${apiConfiguration.authEndpoint}/credits`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			})
				.then(async (response) => {
					if (!response.ok) throw new Error(await response.text())
					const data = await response.json()
					setBalance(data.balance?.currentBalance || 0)
					setUsageData(data.usageTransactions || [])
					setPaymentsData(data.paymentTransactions || [])
				})
				.catch((error: Error) => {
					console.error("Failed to fetch user credits data:", error)
				})
				.finally(() => setIsLoading(false))
		}
	}, [user, accessToken, apiConfiguration?.authEndpoint])

	const handleLoginSuccess = (token: string) => {
		setAccessToken(token)
	}

	const handleLogout = () => {
		setAccessToken(null)
	}
	return (
		<div className="h-full flex flex-col">
			{user ? (
				<div className="flex flex-col pr-3 h-full">
					<div className="flex flex-col w-full">
						<div className="flex items-center mb-6 flex-wrap gap-y-4">You have logged in.</div>
					</div>

					<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
						<VSCodeButton appearance="secondary" onClick={handleLogout} className="w-full min-[225px]:w-1/2">
							Log out
						</VSCodeButton>
					</div>

					<VSCodeDivider className="w-full my-6" />
				</div>
			) : (
				<div className="flex flex-col items-center pr-3">
					<ClineLogoWhite className="size-16 mb-4" />

					<p style={{}}>
						Sign up for an account to get access to the latest models, billing dashboard to view usage and credits,
						and more upcoming features.
					</p>

					<LoginForm onLoginSuccess={handleLoginSuccess} />
				</div>
			)}
		</div>
	)
}

export default memo(AccountView)
