import axios from "axios"
import { authService } from "./auth"

const PUBLIC_AUTH_PATHS = new Set([
  "/auth/authenticate",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/send-verification-code",
  "/auth/verify-email-code",
  "/auth/verify-otp",
])

const normalizeApiBaseUrl = (rawBaseUrl?: string) => {
  const baseUrl = (rawBaseUrl || "http://localhost:8080/api").replace(/\/+$/, "")
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`
}

const normalizeRequestUrl = (url?: string) => {
  if (!url) return url
  return url.startsWith("/api/") ? url.slice(4) : url
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    config.url = normalizeRequestUrl(config.url)

    if (config.url && PUBLIC_AUTH_PATHS.has(config.url)) {
      delete config.headers.Authorization
      return config
    }

    const authHeader = authService.getAuthHeader()
    if ("Authorization" in authHeader) {
      config.headers.Authorization = authHeader.Authorization
    } else {
      console.warn("No Auth Header found in request to", config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.clearAuth()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api

