// Prefer message field, then stringified data, else statusText

const ACCESS_KEY = "chatapp_access_token";
const REFRESH_KEY = "chatapp_refresh_token";
const USER_KEY = "chatapp_user";

export function saveTokens({access, refresh,user}={}){
    if(access) localStorage.setItem(ACCESS_KEY,access);
    if(refresh) localStorage.setItem(REFRESH_KEY,refresh);
    if(user) localStorage.setItem(USER_KEY,JSON.stringify(user));
}

export function loadTokens(){
    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw? JSON.parse(userRaw):null;
    return {access,refresh,user};
}

export function clearTokens(){
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
}