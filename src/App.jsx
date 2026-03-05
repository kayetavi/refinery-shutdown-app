import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Equipment from "./pages/Equipment";
import Recommendation from "./pages/Recommendation";
import NDT from "./pages/NDT";
import PreCleaning from "./pages/PreCleaning";
import PostCleaning from "./pages/PostCleaning";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/recommendation/:id" element={<Recommendation />} />
          <Route path="/ndt/:id" element={<NDT />} />
          <Route path="/preclean/:id" element={<PreCleaning />} />
          <Route path="/postclean/:id" element={<PostCleaning />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
