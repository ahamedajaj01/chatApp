// This file creates a SINGLE axios instance.
// All API services will use this client.
// Benefits of using a centralized apiClient:
// - Automatically attaches base URL
// - Automatically attaches access token to requests
// - Handles 401 responses and token refresh automatically
// - Centralized error handling (can be added later)
// - Easier to maintain and update API interaction logic
// - Easy to switch backend URLs or add features like logging

import axios from "axios";
import config from "../config/config.js"; // contains base URL
import { saveTokens, loadTokens, clearTokens } from "./tokenUtils.js";

// Create axios instance with BASE URL from .env
const apiClient = axios.create({
  baseURL: config.chatappUrl,
  withCredentials: false, // not using cookies (JWT setup)
});

// helper state for refresh flow
let isRefreshing = false;
let failedQueue = []; // items: { resolve, reject, config }

// callback that store.js can set to receive token updates
let onTokenRefreshCallback = null;
export function setOnTokenRefresh(cb){
  onTokenRefreshCallback=cb
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else {
      // ensure Authorization header is set on the saved config
      if (token) prom.config.headers = prom.config.headers || {};
      if (token) prom.config.headers.Authorization = `Bearer ${token}`;
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};

//  REQUEST interceptor → attach access token (redux first, fallback to storage)
apiClient.interceptors.request.use(
  (request) => {
    try {
      const Persisted = loadTokens()
      const token = Persisted?.access;
      if (token) request.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      // safe-fail: do nothing
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: on 401 try refresh and retry original request
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
   const originalRequest = error?.config;

   // If there's no response or it's not a 401, reject immediately
   if(!error.response || error.response.status !== 401){
       return Promise.reject(error);
   }
   // Prevent infinite retry loops
   if(originalRequest && originalRequest._retry){
    return Promise.reject(error)
   }
    if (originalRequest) originalRequest._retry = true;

   // Get refresh token from redux or storage
   const stored = loadTokens();
   const refreshToken = stored?.refresh;

   if (!refreshToken){
     // clear persisted tokens for safety and reject
    clearTokens();
    return Promise.reject(error)
   }

       // If a refresh is already in progress, queue this request
   if (isRefreshing){
    // Queue the request until refresh finishes
    return new Promise((resolve, reject =>{
        failedQueue.push({resolve,reject,config:originalRequest});
    }))
   }

   // Start refresh
   isRefreshing = true

   try {
    // Use raw axios to call refresh endpoint to avoid using apiClient (which would recurse)
    const refreshUrl  =`${config.chatappUrl.replace(/\/$/, "")}/token/refresh/`
    const refreshResp = await axios.post(refreshUrl,{refresh:refreshToken});
    const newAccess = refreshResp?.data?.access;
    const newRefresh = refreshResp?.data?.refresh || refreshToken;

    if(!newAccess) throw new Error("No access token returned during refresh")

        // Persist and update redux
        const user = stored?.user ?? null;
    saveTokens({access:newAccess, refresh:newRefresh, user});
    // notify registered callback (store can dispatch setAuth)
    if(typeof onTokenRefreshCallback === "function"){
      try {
        onTokenRefreshCallback({access: newAccess, refresh:newRefresh})
      } catch (error) {
        // swallow callback errors to keep refresh flow alive
      }
    }

    // Process queued requests
    processQueue(null, newAccess);
    isRefreshing = false

    // Retry the original request with new token
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
    return apiClient(originalRequest)

   } catch (error) {
    // Refresh failed: reject queued requests and clear auth
    processQueue(error, null)
    isRefreshing=false
    clearTokens();
    return Promise.reject(error)
    
   }
 }
); 


// Export the client for all services to use
export default apiClient;
