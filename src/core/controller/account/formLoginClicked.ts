import { Controller } from "../index"
import fetch from "node-fetch"
import { FormLoginRequest, LoginResponse } from "@shared/proto/cline/account"

/**
 * Handles form-based login by making a POST request to authEndpoint
 * with username/password form parameters
 */
export async function formLoginClicked(controller: Controller, req: FormLoginRequest): Promise<LoginResponse> {
	try {
		// Validate authEndpoint format
		if (!req.authEndpoint || !req.authEndpoint.startsWith("http")) {
			throw new Error("Invalid authentication endpoint URL")
		}

		const params = new URLSearchParams()
		params.append("username", req.username)
		params.append("password", req.password)

		const response = await fetch(`${req.authEndpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params.toString(),
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `Login failed: ${response.statusText}`)
		}

		const data = await response.json()
		if (!data.access_token && !data.accessToken) {
			throw new Error("Invalid response: missing access token")
		}

		// Return response matching proto definition
		return LoginResponse.create({
			accessToken: data.access_token || data.accessToken,
		})
	} catch (error) {
		console.error("Login error:", error)
		throw new Error(`Login error: ${error instanceof Error ? error.message : String(error)}`)
	}
}
