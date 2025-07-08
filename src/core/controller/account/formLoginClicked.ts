import { Controller } from "../index"
import fetch from "node-fetch"
import { FormLoginRequest, LoginResponse } from "@shared/proto/account"

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

		const response = await fetch(`${req.authEndpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: req.username,
				password: req.password,
			}),
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
