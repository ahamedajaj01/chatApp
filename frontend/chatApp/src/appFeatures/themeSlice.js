import {createSlice} from "@reduxjs/toolkit"

const initialState = {
    darkMode: false
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers:{
        setDarkMode: (state,action)=>{
            state.darkMode = action.payload;
        },
        toggleDarkMode: (state)=>{
            state.darkMode =!state.darkMode;
        }
    }
});
    
export const { setDarkMode,toggleDarkMode } = themeSlice.actions;
export default themeSlice.reducer

