// ==============================
// Conversioni base
// ==============================

// Scala spaziale: quanti pixel corrispondono a 1 metro reale
export const PIXELS_PER_METER = 100; // 1 m = 100 px

export const FPS_FOR_SIMULATIONS = 60; //I think the max FPS is 60

// Scala temporale: durata di un frame in secondi 
export const SECONDS_PER_FRAME = 1 / FPS_FOR_SIMULATIONS;

// ==============================
// Costanti fisiche di riferimento
// ==============================

// Accelerazione di gravità terrestre in m/s²
export const EARTH_G_SI = 9.81;

// ==============================
// Funzioni di conversione
// ==============================

// Lunghezza: metri ↔ pixel
export const metersToPixels = m => m * PIXELS_PER_METER;
export const pixelsToMeters = px => px / PIXELS_PER_METER;

// Massa: kg → kg (nessuna conversione necessaria)
export const kgToSimMass = kg => kg;
export const simMassToKg = simMass => simMass;

// Costante elastica: N/m → N/pixel
export const springK_SI_to_px = k_SI => k_SI / PIXELS_PER_METER;
export const springK_px_to_SI = k_px => k_px * PIXELS_PER_METER;

// Accelerazione: m/s² → px/frame²
export const accelSI_to_pxSec = a_SI => a_SI * PIXELS_PER_METER * Math.pow(SECONDS_PER_FRAME, 2); // a_SI * PIXELS_PER_METER;
export const accelPxSec_to_SI = a_px => a_px / (PIXELS_PER_METER * Math.pow(SECONDS_PER_FRAME, 2)); //a_px / PIXELS_PER_METER;

/* // Accelerazione: m/s² → px/frame² (se integri per frame)
export const accelSI_to_pxFrame = a_SI =>
  (a_SI * PIXELS_PER_METER) * Math.pow(SECONDS_PER_FRAME, 2);
export const accelPxFrame_to_SI = a_pxFrame =>
  a_pxFrame / PIXELS_PER_METER / Math.pow(SECONDS_PER_FRAME, 2); */

// ==============================
// Tipi di gravità (px/s²)
// ==============================
export const gravityTypes = ((earthG = EARTH_G_SI) => [
  { value: accelSI_to_pxSec(0.000 * earthG), label: "Zero Gravity" },
  { value: accelSI_to_pxSec(0.028 * earthG), label: "Ceres (0.27 m/s²)" },
  { value: accelSI_to_pxSec(0.063 * earthG), label: "Pluto (0.62 m/s²)" },
  { value: accelSI_to_pxSec(0.165 * earthG), label: "Moon (1.62 m/s²)" },
  { value: accelSI_to_pxSec(0.378 * earthG), label: "Mercury (3.70 m/s²)" },
  { value: accelSI_to_pxSec(0.379 * earthG), label: "Mars (3.71 m/s²)" },
  { value: accelSI_to_pxSec(0.886 * earthG), label: "Uranus (8.69 m/s²)" },
  { value: accelSI_to_pxSec(0.904 * earthG), label: "Venus (8.87 m/s²)" },
  { value: accelSI_to_pxSec(1.000 * earthG), label: "Earth (9.81 m/s²)" },
  { value: accelSI_to_pxSec(1.065 * earthG), label: "Saturn (10.44 m/s²)" },
  { value: accelSI_to_pxSec(1.140 * earthG), label: "Neptune (11.15 m/s²)" },
  { value: accelSI_to_pxSec(2.528 * earthG), label: "Jupiter (24.79 m/s²)" }
])();
