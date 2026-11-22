"use client";

import {
  createSimulation,
  LockAxis,
  drawSegment,
  toScreen,
} from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/CartPulley.js";
import { cartPulley, cartPulleyModel } from "./cartPulleyPhysics.js";

export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },
  build({ world, inputs, bounds }) {
    const narrow = bounds.width < 5;
    const cartY = bounds.height * (narrow ? 0.72 : 0.58);
    const start = { cartX: bounds.width * 0.18, hangerY: cartY - 0.45 };
    const pulleyX = bounds.width * 0.78;
    // On narrow screens the shared information panel sits at the bottom.
    const floor = narrow ? 1.75 : 0.35;
    const travel = Math.max(
      0,
      Math.min(pulleyX - start.cartX - 0.55, start.hangerY - floor)
    );
    const cart = world.addBody({
      label: "cart",
      mass: () => Math.max(0.01, Number(inputs.cartMass) || 0.01),
      size: 0.42,
      shape: "square",
      color: "#3b82f6",
      draggable: false,
      at: [start.cartX, cartY],
    });
    const hanger = world.addBody({
      label: "hanger",
      mass: () => Math.max(0.01, Number(inputs.hangingMass) || 0.01),
      size: 0.3,
      shape: "square",
      color: "#f59e0b",
      draggable: false,
      at: [pulleyX, start.hangerY],
    });
    const mechanism = cartPulley(cart, hanger, inputs, start, travel);
    world.add(
      mechanism,
      LockAxis(cart, { y: cartY }),
      LockAxis(hanger, { x: pulleyX }),
      {
        zIndex: -1,
        render({ p }) {
          drawSegment(
            p,
            { x: 0, y: cartY - 0.22 },
            { x: pulleyX, y: cartY - 0.22 },
            { weight: 4 }
          );
          // The front edge of the cart meets this stop at the end of travel.
          const stopX = start.cartX + travel + 0.21;
          drawSegment(
            p,
            { x: stopX, y: cartY - 0.22 },
            { x: stopX, y: cartY - 0.03 },
            { color: "#f8fafc", weight: 6 }
          );
          drawSegment(p, cart.state.position, { x: pulleyX, y: cartY });
          drawSegment(p, { x: pulleyX, y: cartY }, hanger.state.position);
          const pulley = toScreen({ x: pulleyX, y: cartY });
          p.push();
          p.fill("#64748b");
          p.stroke("#cbd5e1");
          p.strokeWeight(2);
          p.circle(pulley.x, pulley.y, 18);
          p.pop();
        },
      }
    );
    return { cart, mechanism };
  },
  info({ handles, inputs }) {
    return {
      state: {
        ...cartPulleyModel(inputs.cartMass, inputs.hangingMass, inputs.gravity),
        stopped: handles.mechanism.stopped,
        speed: Math.abs(handles.cart.state.velocity.x),
      },
    };
  },
});
