const TOKEN_KEY = "auth_token"
const ROLE_KEY = "auth_role"
const NAME_KEY = "auth_name"
const EMAIL_KEY = "auth_email"
const ID_KEY = "auth_id"

export interface AuthResponse {
  token: string
  role: string
  name: string
  email: string
  id: number
}

export const authService = {
  // Save authentication token and role
  setAuth: (response: AuthResponse) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(ROLE_KEY, response.role)
      localStorage.setItem(NAME_KEY, response.name)
      localStorage.setItem(EMAIL_KEY, response.email)
      localStorage.setItem(ID_KEY, response.id.toString())
    }
  },

  // Get authentication token
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  // Get user role
  getRole: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ROLE_KEY)
    }
    return null
  },

  // Get full user details
  getUser: () => {
    if (typeof window !== "undefined") {
      return {
        id: localStorage.getItem(ID_KEY),
        name: localStorage.getItem(NAME_KEY),
        email: localStorage.getItem(EMAIL_KEY),
        role: localStorage.getItem(ROLE_KEY)
      }
    }
    return null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getToken() !== null
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    return authService.getRole() === "ADMIN"
  },

  // Clear authentication
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ROLE_KEY)
      localStorage.removeItem(NAME_KEY)
      localStorage.removeItem(EMAIL_KEY)
      localStorage.removeItem(ID_KEY)
    }
  },

  // Get authorization header for API requests
  getAuthHeader: (): { Authorization: string } | {} => {
    const token = authService.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
}

