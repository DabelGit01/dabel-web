import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
	baseURL: "/api",
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response) {
			const { status, config } = error.response;
			const url = config.url || "";
			const isAuthRequest = url.includes("/login") || url.includes("/signup");

			// If unauthorized or forbidden, and hitting an admin API route (excluding login/signup)
			if (
				(status === 401 || status === 403) &&
				(url.includes("/admin/") || url.includes("/api/admin/")) &&
				!isAuthRequest
			) {
				toast.error("Session expired or access revoked. Logging out...");

				// Execute a direct logout POST to clear the session cookie
				try {
					// Use axios directly instead of api to avoid infinite interceptor loops
					await axios.post("/api/admin/logout");
				} catch (logoutError) {
					console.error("Logout request failed:", logoutError);
				} finally {
					window.location.href = "/admin/login";
				}
			}
		}
		return Promise.reject(error);
	},
);
