import apiClient from "./apiClient";

export class AuthService {
  // POST /login/  -> expects { username/email & password } -> returns { access, refresh, ... }
  async login({ username, email, password }) {
    try {
      // Ensure that at least one of username or email is provided
      if (!username && !email) {
        console.error('Error: Either username or email must be provided');
        throw new Error('Either username or email must be provided');
      }
      // Accept either username or email depending on backend expectation.
      const body = username ? { username, password } : { email, password };
      // Log the request body to debug
      const resp = await apiClient.post("/login/", body);
      return resp.data;
    } catch (error) {
      // Normalize error shape for thunks (rejectWithValue takes message)
      throw this._extractError(error);
    }
  }

  // POST /token/refresh/ -> expects { refresh } -> returns { access }
  async refreshToken(refreshToken) {
    try {
      const resp = await apiClient.post("token/refresh/", {
        refresh: refreshToken,
      });
      return resp.data;
    } catch (error) {
      throw this._extractError(error);
    }
  }

  // POST /register/ -> expects { username/email, password, ... } -> returns created user (or tokens)
  async signup(payload) {
    try {
      const resp = await apiClient.post("/register/", payload);
      return resp.data;
    } catch (error) {
      throw this._extractError(error);
    }
  }

  // get current user.
  async getCurrentUser() {
    try {
      const resp = await apiClient.get("/users/me/");
      return resp.data;
    } catch (error) {
      throw this._extractError(error);
    }
  }

  // This function does not clear redux state — it just calls an endpoint if you have one.
  async logout(refreshToken) {
    try {
      // ensure caller passes the refresh token
      if (!refreshToken) throw new Error("Refresh token required for logout");
      // If your backend provides an endpoint to revoke tokens, call it here.
      await apiClient.post("/logout/", { refresh: refreshToken });
      return true;
    } catch (error) {
      // use _extractError to normalize axios/backend errors
      throw this._extractError(error);
    }
  }

  // Internal helper to extract a human-friendly error message
  _extractError(error) {
    // axios error shape handling
    if (error?.response?.data) {
      // backend provided structured errors (object/string)
      const data = error.response.data;
      // Prefer message field, then stringified data, else statusText
      return (
        data.message ||
        JSON.stringify(data) ||
        error.response.statusText ||
        error.message
      );
    }
    return error.message || "unknown error";
  }
}

const authService = new AuthService();
export default authService;
