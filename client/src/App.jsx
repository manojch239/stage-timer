import { BrowserRouter, Routes, Route } from "react-router-dom";
import Controller from "./pages/Controller";
import Viewer from "./pages/Viewer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Controller />} />
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;