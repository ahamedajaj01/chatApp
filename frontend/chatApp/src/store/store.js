import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../appFeatures/auth/authSlice"
import chatReducer from "../appFeatures/chat/chatSlice"
import themeReducer from "../appFeatures/themeSlice"

const store = configureStore({
    reducer:{
        // Add reducers here
        auth: authReducer,
        chat: chatReducer, 
        theme: themeReducer,
    
    }
})

export default store;