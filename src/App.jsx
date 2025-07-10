import { Route, BrowserRouter, Routes } from "react-router-dom"
import { Home } from "./pages/home.jsx"
import { BouncingBall } from "./pages/BouncingBall.jsx"
import { VectorsOperations } from "./pages/VectorsOperations.jsx"
import { Error } from "./pages/error.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route index element={<Home />} />
          <Route path="BouncingBall" element={<BouncingBall />} />
          <Route path="VectorsOperations" element={<VectorsOperations />} />
          <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}
