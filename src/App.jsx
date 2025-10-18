// src/App.jsx
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { routes } from "./routes";
import { Home } from "./pages/home.jsx";
import { Error } from "./pages/error.jsx";
import "katex/dist/katex.min.css";
import { BouncingBall } from "./pages/simulations/BouncingBall.jsx";
import { VectorsOperations } from "./pages/simulations/VectorsOperations.jsx";
import { BallAcceleration } from "./pages/simulations/BallAcceleration.jsx";
import { BallGravity } from "./pages/simulations/BallGravity.jsx";
import { SpringConnection } from "./pages/simulations/SpringConnection.jsx";
import { SimplePendulum } from "./pages/simulations/SimplePendulum.jsx";
import Contribute from "./pages/contribute.jsx";
import About from "./pages/about.jsx";
import Simulations from "./pages/simulations.jsx";

const components = {
  Home,
  Contribute,
  Simulations,
  About,
  BouncingBall,
  VectorsOperations,
  BallAcceleration,
  BallGravity,
  SpringConnection,
  SimplePendulum,
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map(({ path, component }) => {
          const Element = components[component];
          return <Route key={path} path={path} element={<Element />} />;
        })}
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}
