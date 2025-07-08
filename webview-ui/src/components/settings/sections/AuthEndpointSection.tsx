import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { useExtensionState } from "../../../context/ExtensionStateContext"
import { DebouncedTextField } from "../common/DebouncedTextField"
import Section from "../Section"
import { StateServiceClient } from "../../../services/grpc-client"
import { UpdateSettingsRequest } from "@shared/proto/state"

interface AuthEndpointSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

export const AuthEndpointSection: React.FC<AuthEndpointSectionProps> = ({ renderSectionHeader }) => {
	const { authEndpoint, setAuthEndpoint } = useExtensionState()

	return (
		<div>
			{renderSectionHeader("auth")}
			<Section>
				<div id="auth-endpoint-section" style={{ marginBottom: 20 }}>
					<div style={{ marginBottom: 15 }}>
						<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
							Octopus Authentication Endpoint
						</label>
						<DebouncedTextField
							initialValue={authEndpoint || ""}
							placeholder="https://your-auth-endpoint.com"
							style={{ width: "100%" }}
							onChange={async (value) => {
								setAuthEndpoint(value || null)
								try {
									await StateServiceClient.updateSettings(
										UpdateSettingsRequest.create({
											authEndpoint: value || "",
										}),
									)
								} catch (error) {
									console.error("Failed to update auth endpoint:", error)
								}
							}}
						/>
						<p
							style={{
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								margin: "4px 0 0 0",
							}}>
							Set the authentication endpoint for accessing Octopus services
						</p>
					</div>
				</div>
			</Section>
		</div>
	)
}

export default AuthEndpointSection
