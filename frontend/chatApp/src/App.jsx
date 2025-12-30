import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navbar, Footer } from "./components/index";
import { Routes, Route, useLocation } from "react-router-dom";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import { LoginPage, Home, SignupPage, UserChat } from "./pages";
import { setDarkMode } from "./appFeatures/themeSlice";
import useChatListSocket from "./appFeatures/chat/hooks/useChatListSocket";
import {ResetPasswordModal} from "./components/index";


function App() {
  const dispatch = useDispatch();
  useChatListSocket() // Custom hook to manage chat list WebSocket connection
  // Load saved theme on startup
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      dispatch(setDarkMode(true));
    }
  }, []);
  // To apply toggle effect in website
  const darkMode = useSelector((state) => state.theme.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("theme", "dark"); // ✅ Save to localStorage
    } else {
      document.documentElement.setAttribute("data-bs-theme", "light");
      localStorage.setItem("theme", "light"); // ✅ Save to localStorage
    }
  }, [darkMode]);

  // const token = useSelector((state) => state.auth.accessToken);

  // location to track route changes
const location = useLocation();
const isChatRoute = location.pathname.startsWith('/chats');

  return (
    <>
      {!isChatRoute && <Navbar />}

      <Routes>
        {/* Public routes (only for non-authenticated users) */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordModal  />} />
        </Route>

        {/* Private routes (requires auth) */}
        <Route element={<PrivateRoute />}>
          <Route path="/chats/:conversationId?" element={<UserChat />} />
        </Route>

        {/* Fallback public pages */}
        <Route path="*" element={<Home />} />
      </Routes>

      {!isChatRoute && <Footer />}
    </>
  );
}

export default App;
