import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/AuthStore";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { ResetPassword } from "./pages/ResetPassword";
import { UpdatePassword } from "./pages/UpdatePassword";
import { Dashboard } from "./components/Dashboard";
import { TransactionsPage } from "./components/Transactions";
import "./App.css";
import { useEffect } from "react";
import { Layout } from "./layout/Layout";

function App() {
  useEffect(() => {
    const cleanup = useAuthStore.getState().initAuthListener();
    return cleanup;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/*Auth pages - NO components */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/*App PAGES*/}
        <Route element={<Layout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
