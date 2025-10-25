// src/data/configs/BallAcceleration.js
// EN: Configuration and info mapping for the Ball Acceleration simulation
// IT: Configurazione e mappatura informazioni per la simulazione Accelerazione della Palla

export const INITIAL_INPUTS = {
  // EN: Ball visual size in pixels
  // IT: Dimensione visiva della palla in pixel
  size: 48,
  // EN: Maximum speed in pixels per frame
  // IT: Velocità massima in pixel per frame
  maxspeed: 5,
  // EN: Acceleration rate applied toward the target (mouse)
  // IT: Tasso di accelerazione applicato verso il target (mouse)
  acceleration: 0.1,
  // EN: Ball color
  // IT: Colore della palla
  ballColor: "#7f7f7f",
};

export const INPUT_FIELDS = [
  { name: "size", label: "Ball Size (px):", type: "number", placeholder: "Insert ball size..." },
  { name: "maxspeed", label: "Max Speed (px/frame):", type: "number", placeholder: "Insert max speed..." },
  { name: "acceleration", label: "Acceleration (px/frame²):", type: "number", placeholder: "Insert acceleration..." },
  { name: "ballColor", label: "Ball Color:", type: "color" },
];

// EN: Mapper for the info panel: computes speed, acceleration magnitude, and distance to target
// IT: Mapper per il pannello info: calcola velocità, modulo dell'accelerazione e distanza dal target
export const SimInfoMapper = (state) => {
  const { pos, vel, acc, target } = state;
  const speed = Math.hypot(vel.x, vel.y); // px/frame
  const accMag = Math.hypot(acc.x, acc.y); // px/frame²
  const dist = target ? Math.hypot(target.x - pos.x, target.y - pos.y) : 0; // px

  return {
    // EN: Speed in px/frame; roughly proportional to visual motion per frame
    // IT: Velocità in px/frame; approssimativamente proporzionale al moto visivo per frame
    speed: `${speed.toFixed(2)} px/frame`,
    // EN: Acceleration magnitude in px/frame²
    // IT: Modulo accelerazione in px/frame²
    acceleration: `${accMag.toFixed(3)} px/frame²`,
    // EN: Distance to mouse target in pixels
    // IT: Distanza dal target del mouse in pixel
    distanceToTarget: `${dist.toFixed(1)} px`,
    // EN: Position (x, y) in pixels
    // IT: Posizione (x, y) in pixel
    position: `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}) px`,
  };
};
