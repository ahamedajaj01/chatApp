// -----------------------------------------------------------------
// authSlice: Redux Toolkit slice that manages authentication state.
// - Keeps user, accessToken, refreshToken in Redux.
// - Exposes thunks: login, signup, refreshAccess, logout.
// - Persists tokens to storage via tokenUtils on explicit login/signup.
// - apiClient's refresh logic can dispatch the plain setAuth action
//   to update tokens when a refresh occurs.
// -----------------------------------------------------------------
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../api/authService";
import { saveTokens, loadTokens, clearTokens } from "../../api/tokenUtils";

/*
  THUNK: login
  - Calls authService.login(credentials)
  - Expects the service to return an object like: { access, refresh, user? }
  - On success: returns that object to the fulfilled reducer which saves tokens
*/
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, username, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login({ email, username, password });
      return data;
    } catch (error) {
      // rejectWithValue is useful so your UI can read action.payload on error
      return rejectWithValue(
        error?.detail ||
          error?.message ||
          "Login failed! Invalid username or password"
      );
    }
  }
);

/*
  THUNK: signup
  - Calls authService.signup(payload)
  - Useful for register flows that return tokens (or return user and require a login step).
*/
export const signup = createAsyncThunk(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.signup(payload);
      return data;
    } catch (error) {
       const data = error.response?.data;

  let message = "Signup failed";

  if (typeof data === "string") {
    message = data;
  } else if (data?.detail) {
    message = data.detail;
  } else if (data?.message) {
    message = data.message;
  } 
  // ✅ ADD THIS BLOCK (THIS IS THE FIX)
  else {
    // Handle Django/DRF validation errors: { field: [msg] }
    const firstKey = data && Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) {
      message = data[firstKey][0];
    }
  }

  return rejectWithValue(message);
    }
  }
);

/*
  THUNK: getCurrentUser
  - Calls authService.getCurrentUser()
  - Requires valid access token (apiClient adds it automatically)
  - Returns user object
*/
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(error?.toString?.() || String(error));
    }
  }
);

/*
  THUNK: refreshAccess (manual)
  - You don't always need to call this manually because apiClient already
    performs automatic refresh on 401 and dispatches setAuth.
    - This thunk is handy for explicit refresh flows (e.g., background refresh).
    */
export const refreshAccess = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Prefer redux stored refresh token, fallback to persisted storage
      const stateRefresh = getState()?.auth?.refreshToken;
      const stored = loadTokens();
      const refresh = stateRefresh || stored.refresh;

      if (!refresh) throw new error("No refresh token available");

      const data = await authService.refreshToken(refresh);
      // return whatever the backend gave us
      return data;
    } catch (error) {
      return rejectWithValue(error?.toString?.() || String(error));
    }
  }
);

/*
  THUNK: logout
  - Calls authService.logout(refreshToken) to revoke/blacklist the refresh token.
  - On success, clears persisted tokens and resets Redux auth state.
  - If there is no refresh token available, we still clear local state.
*/
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const refreshFromState = state?.auth?.refreshToken;
      const stored = loadTokens();
      const refresh = refreshFromState || stored.refresh;
      if (refresh) {
        // authService.logout will throw on bad request/network error
        await authService.logout(refresh);
      }
      // clear local persistence and inform slice to reset
      clearTokens();
      dispatch({ type: "auth/clearAuth" });
      return true;
    } catch (error) {
      // still try to clear local state even if server call failed
      clearTokens();
      dispatch({ type: "auth/clearAuth" });
      return rejectWithValue(error?.toString?.() || String(error));
    }
  }
);

// Seed initial state from persisted storage so refresh survives page reload
const persisted = loadTokens();
const initialState = {
  user: persisted.user || null,
  accessToken: persisted.access || null,
  refreshToken: persisted.refresh || null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Plain action used by apiClient when automatic refresh occurs.
    // apiClient dispatches { type: 'auth/setAuth', payload: { access, refresh } }
    setAuth: (state, action) => {
      const { access, refresh, user } = action.payload || {};
      if (access) state.accessToken = access;
      if (refresh) state.refreshToken = refresh;
      if (user) state.user = user;
      state.error = null;
    },

    // Used by logout thunk and other places to reset auth state locally.
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "idle";
      state.error = null;
    },
  },

  //   extraReducers:
  extraReducers: (builder) => {
    // login
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { access, refresh, user } = action.payload || {};
        state.accessToken = access || state.accessToken;
        state.refreshToken = refresh || state.refreshToken;
        state.user = user || state.user;
        // Persist tokens so page reloads keep the session.
        saveTokens({
          access: state.accessToken,
          refresh: state.refreshToken,
          user: state.user,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      });

    //   getCurrentUser
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload; // overwrite with fresh user data
        saveTokens({
          access: state.accessToken,
          refresh: state.refreshToken,
          user: state.user,
        });
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      });

    //  signup
    builder
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload?.user || null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        // state.error = action.payload ?? action.error.message;
      });

    //  Refresh (manual)
    builder
      .addCase(refreshAccess.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshAccess.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { access, refresh } = action.payload || {};
        if (access) state.accessToken = access;
        if (refresh) state.refreshToken = refresh;
        saveTokens({
          access: state.accessToken,
          refresh: state.refreshToken,
          user: state.user,
        });
      })
      .addCase(refreshAccess.rejected, (state) => {
        // failed refresh → clear auth locally
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = "idle";
        state.error = "Session expired";
        clearTokens();
      });

    //   Logout
    builder
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        // Even if logout call failed, we cleared local tokens in the thunk.
        state.status = "idle";
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      });
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
