// utils/constants.js
export const MIN_PANEL = 110;      // ⬅ ajústalo si quieres un panel más ancho
// Gap horizontal entre tablero y panel (el mismo que usas en <GameArea gap={10}>)
export const GAP = 10;

// El tamaño de cada celda se calcula restando MIN_PANEL + GAP al ancho total
// de la ventana; con eso garantizamos que tablero + panelpanorámico caben
export const CELL_SIZE = `clamp(8px, min(calc((100vw - ${MIN_PANEL + GAP}px) / 12), calc((100vh - 100px) / 20)), 32px)`;


export const BORDER_EMPTY  = '1px solid #222';
export const BORDER_FILLED = '2px solid #000';
