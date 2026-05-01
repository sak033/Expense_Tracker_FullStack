import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GroupDetails from "./pages/GroupDetails";  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups/:id" element={<GroupDetails />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;