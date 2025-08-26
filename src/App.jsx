import { Route, BrowserRouter, Routes } from "react-router-dom"
import { Home } from "./pages/home.jsx"
import { Error } from "./pages/error.jsx"

import { BouncingBall } from "./pages/simulations/BouncingBall.jsx"
import { VectorsOperations } from "./pages/simulations/VectorsOperations.jsx"
import { BallAcceleration } from "./pages/simulations/BallAcceleration.jsx"
import { BallGravity } from "./pages/simulations/BallGravity.jsx"
import { SpringConnection } from "./pages/simulations/SpringConnection.jsx"
import { SimplePendulum } from "./pages/simulations/SimplePendulum.jsx"
import Contribute from "./pages/contribute.jsx"
import About from "./pages/about.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route index element={<Home />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/about" element={<About />} />
          <Route path="BouncingBall" element={<BouncingBall />} />
          <Route path="VectorsOperations" element={<VectorsOperations />} />
          <Route path="BallAcceleration" element={<BallAcceleration />} />
          <Route path="BallGravity" element={<BallGravity />} />
          <Route path="SpringConnection" element={<SpringConnection />} />
          <Route path="SimplePendulum" element={<SimplePendulum />} />
          <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}
