"use client";

/**
 * createSimulation — turns a declarative spec into a finished simulation page.
 *
 * Everything that used to be copy-pasted into every simulation file lives here
 * exactly once: input state and persistence, the reset/load controls, canvas
 * setup and resizing, the fixed-timestep loop, pointer event dispatch, the
 * background, and the sim-info panel. A simulation is left with only the part
 * that is actually about physics — which bodies exist and what acts on them.
 *
 *   export default createSimulation({
 *     config: SimplePendulumConfig,
 *     build: ({ world, inputs, bounds }) => {
 *       const pivot = world.addAnchor(bounds.width / 2, bounds.height * 0.9);
 *       const bob = world.addBody({ mass: () => inputs.mass, size: 0.3 });
 *       world.add(
 *         Gravity({ g: () => inputs.gravity }),
 *         Damping({ c: () => inputs.damping }),
 *         Distance(bob, pivot, () => inputs.length)
 *       );
 *       return { bob, pivot };
 *     },
 *   });
 */

import { useState, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

import World from "../World.js";
import { Backdrop } from "../render/Backdrop.js";
import { INTEGRATORS } from "../integrators.js";
import {
  computeSteps,
  resetTime,
  isPaused,
  setPause,
} from "../../constants/Time.js";
import { toMeters } from "../../constants/Utils.js";

import SimulationLayout from "../../components/SimulationLayout.jsx";
import P5Wrapper from "../../components/P5Wrapper.jsx";
import DynamicInputs from "../../components/inputs/DynamicInputs";
import SimInfoPanel from "../../components/SimInfoPanel.jsx";

import useSimulationState from "../../hooks/useSimulationState";
import useSimInfo from "../../hooks/useSimInfo";

/**
 * A live view over the current inputs. Elements capture it once at build time
 * and still read fresh values every frame, which is what lets a slider change
 * behaviour without rebuilding the world.
 */
function createInputsProxy(inputsRef) {
  return new Proxy(
    {},
    {
      get: (_, key) => inputsRef.current[key],
      has: (_, key) => key in inputsRef.current,
      ownKeys: () => Reflect.ownKeys(inputsRef.current),
      getOwnPropertyDescriptor: (_, key) => ({
        ...Object.getOwnPropertyDescriptor(inputsRef.current, key),
        configurable: true,
      }),
    }
  );
}

/**
 * @param {object} spec
 * @param {object} spec.config - The simulation's config module:
 *   `{ INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper? }`.
 * @param {(ctx: object) => object} spec.build - Populate the world. Receives
 *   `{ p, world, inputs, bounds, refs }` and returns named handles (bodies,
 *   constraints) that later hooks get back as `handles`. Re-runs on resize.
 * @param {(ctx: object) => void} [spec.update] - Runs once per frame before the
 *   physics steps, for logic that is not a force (relaunching, measuring).
 *   Call `ctx.rebuild()` from here to discard the world and re-run `build`,
 *   which is how a simulation reacts to an input that changes what exists.
 * @param {(ctx: object) => void} [spec.draw] - Extra rendering after the world.
 *   Prefer adding a render element to the world; use this for one-off overlays.
 * @param {(ctx: object) => {state: object, context: object}} [spec.info] - Feeds
 *   `SimInfoMapper`, keeping the existing mapper signature untouched.
 * @param {(ctx: object) => React.ReactNode} [spec.overlay] - DOM drawn over the canvas.
 * @param {object} [spec.world] - `{ integrator, solverIterations, substeps, fade }`.
 * @param {object} [spec.simInfoRefs] - Refs forwarded to `SimInfoMapper`'s third argument.
 * @returns {React.ComponentType}
 */
export default function createSimulation(spec) {
  const {
    config,
    build,
    update,
    draw,
    info,
    overlay,
    world: worldOptions = {},
  } = spec;

  const { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper } = config;

  return function Simulation() {
    const location = usePathname();
    const storageKey = location.replaceAll(/[/#]/g, "");

    const { inputs, setInputs, inputsRef } = useSimulationState(
      INITIAL_INPUTS,
      storageKey
    );
    const [resetVersion, setResetVersion] = useState(0);

    /**
     * State the sketch can push back into the DOM overlay (a wind indicator, a
     * "landed" banner). Kept out of `refs` because changing it must re-render.
     */
    const [overlayState, setOverlayState] = useState(null);

    const worldRef = useRef(null);
    const handlesRef = useRef({});
    /** Free-form per-simulation storage, handed to every hook as `refs`. */
    const refsRef = useRef({});
    const liveInputs = useMemo(() => createInputsProxy(inputsRef), [inputsRef]);

    // Some existing SimInfoMappers take a third `refs` argument holding values
    // that accumulate across frames (a running maximum, a launch timestamp).
    // Rebuilt on reset so those accumulators start clean.
    const simInfoRefs = useMemo(() => {
      const extra =
        typeof spec.simInfoRefs === "function"
          ? spec.simInfoRefs()
          : spec.simInfoRefs;
      return { refs: refsRef, ...extra };
    }, [resetVersion]);

    // The sketch writes into these too, so it needs a stable handle it can read
    // from inside p.draw without re-creating the sketch callback.
    const simInfoRefsRef = useRef(simInfoRefs);
    simInfoRefsRef.current = simInfoRefs;
    const { simData, updateSimInfo } = useSimInfo({ customRefs: simInfoRefs });

    const handleInputChange = useCallback(
      (name, value) => {
        setInputs((prev) => ({ ...prev, [name]: value }));
        refsRef.current.inputsChanged = true;
      },
      [setInputs]
    );

    const sketch = useCallback(
      (p) => {
        /** (Re)build the world from scratch — on setup and on every resize. */
        const rebuild = () => {
          const world = new World(p, {
            integrator:
              typeof worldOptions.integrator === "string"
                ? INTEGRATORS[worldOptions.integrator]
                : worldOptions.integrator,
            solverIterations: worldOptions.solverIterations,
            substeps: worldOptions.substeps,
            inputs: inputsRef.current,
          });

          world.add(Backdrop({ fade: worldOptions.fade }));

          worldRef.current = world;
          handlesRef.current =
            build({
              p,
              world,
              inputs: liveInputs,
              refs: refsRef.current,
              infoRefs: simInfoRefsRef.current,
              bounds: world.bounds,
              setOverlay: setOverlayState,
            }) ?? {};
        };

        /** The argument every user hook receives. */
        const hookContext = (extra = {}) => ({
          p,
          world: worldRef.current,
          inputs: liveInputs,
          handles: handlesRef.current,
          refs: refsRef.current,
          infoRefs: simInfoRefsRef.current,
          bounds: worldRef.current.bounds,
          setOverlay: setOverlayState,
          rebuild,
          ...extra,
        });

        p.setup = () => {
          const { clientWidth, clientHeight } = p._userNode;
          p.createCanvas(clientWidth, clientHeight);
          rebuild();
        };

        p.windowResized = () => {
          const { clientWidth, clientHeight } = p._userNode;
          p.resizeCanvas(clientWidth, clientHeight);
          rebuild();
        };

        p.draw = () => {
          const world = worldRef.current;
          if (!world) return;

          // Keep the world's view of the inputs current for elements that read
          // `ctx.inputs` rather than closing over the proxy.
          world.inputs = inputsRef.current;
          world.bounds.width = toMeters(p.width);
          world.bounds.height = toMeters(p.height);

          const { dt, steps } = computeSteps(p);

          update?.(hookContext({ dt, steps }));
          for (let i = 0; i < steps; i++) world.step(dt);

          world.render();
          draw?.(hookContext({ dt }));

          if (SimInfoMapper && info) {
            const payload = info(hookContext({ dt }));
            if (payload) {
              updateSimInfo(
                p,
                payload.state ?? payload,
                payload.context ?? {},
                SimInfoMapper
              );
            }
          }
        };

        // --- Pointer events, dispatched to any element that wants them --------
        const dispatch = (hook) => {
          const world = worldRef.current;
          if (!world) return;
          const ctx = hookContext();
          for (const element of world.elements) {
            if (element.enabled === false) continue;
            element[hook]?.(ctx);
          }
        };

        p.mousePressed = () => dispatch("onPointerDown");
        p.mouseDragged = () => dispatch("onPointerMove");
        p.mouseReleased = () => dispatch("onPointerUp");
        p.doubleClicked = () => dispatch("onDoubleClick");
      },
      [inputsRef, liveInputs, updateSimInfo]
    );

    const handleReset = useCallback(() => {
      const wasPaused = isPaused();
      resetTime();
      refsRef.current = {};
      if (wasPaused) setPause(true);
      setResetVersion((v) => v + 1);
    }, []);

    const handleLoad = useCallback(
      (loadedInputs) => {
        setInputs(loadedInputs);
        setResetVersion((v) => v + 1);
      },
      [setInputs]
    );

    return (
      <SimulationLayout
        onReset={handleReset}
        inputs={inputs}
        simulation={location}
        onLoad={handleLoad}
        dynamicInputs={
          <DynamicInputs
            config={INPUT_FIELDS}
            values={inputs}
            onChange={handleInputChange}
          />
        }
      >
        <P5Wrapper
          sketch={sketch}
          key={resetVersion}
          simInfos={<SimInfoPanel data={simData} />}
        />
        {overlay?.({ inputs, state: overlayState, refs: refsRef.current })}
      </SimulationLayout>
    );
  };
}
