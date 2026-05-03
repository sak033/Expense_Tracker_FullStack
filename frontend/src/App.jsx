import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GroupDetails from "./pages/GroupDetails";  
import Register from "./pages/Register";
import CreateGroup from "./pages/CreateGroup"; 
import { Toaster } from "react-hot-toast"; 

function App() {
  return (

    <BrowserRouter>
      <Toaster position="top-right"/>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-group" element={<CreateGroup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;