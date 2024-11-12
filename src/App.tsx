import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import SignIn from "./Pages/SignIn";
import RequireAuth from "./components/RequireAuth";
import { useState } from "react";
import ChatLayout from "./layouts/ChatLayout";

interface IAuth {
  username: string;
  token: string;
}

function App() {
  const [auth, setAuth] = useState<IAuth>({
    username: sessionStorage.getItem("username") || "",
    token: sessionStorage.getItem("authToken") || "",
  });
  const navigate = useNavigate();

  const onLoginSuccess = (username: string, token: string) => {
    setAuth({ username, token });
    navigate(`/chatgram/${username}`);
  };

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SignIn onLoginSuccess={onLoginSuccess} />} />

        {/* Protected routes */}
        <Route path="/chatgram" element={<RequireAuth token={auth.token} />}>
          <Route path=":username" element={<ChatLayout />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
