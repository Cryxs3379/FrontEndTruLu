import { useState, useEffect } from 'react';
import { createStage } from '../utils/createStage';

export const useStage = (player, resetPlayer) => {
  const [stage, setStage] = useState(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = newStage =>
      newStage.reduce((acc, row) => {
        if (row.every(cell => cell[0] !== 0)) {
          setRowsCleared(prev => prev + 1);
          acc.unshift(new Array(newStage[0].length).fill([0, 'clear']));
        } else {
          acc.push(row);
        }
        return acc;
      }, []);

    const updateStage = prevStage => {
      // 1) limpia solo las celdas 'clear'
      const newStage = prevStage.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // 2) fusiona la pieza si está colisionada
      if (player.collided) {
        player.tetromino.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              const posY = y + player.pos.y;
              const posX = x + player.pos.x;
              if (newStage[posY] && newStage[posY][posX]) {
                newStage[posY][posX] = [value, 'merged'];
              }
            }
          });
        });
        resetPlayer();
        return sweepRows(newStage);
      }

      // 3) dibuja la pieza en movimiento
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const posY = y + player.pos.y;
            const posX = x + player.pos.x;
            /* 👇 SOLO pintamos si la celda aún está libre.
               Si es 'merged' (ya ocupada), la dejamos intacta */
            if (
              newStage[posY] &&
              newStage[posY][posX] &&
              newStage[posY][posX][1] !== 'merged'
            ) {
              newStage[posY][posX] = [value, 'clear'];
            }
          }
        });
      });

      return newStage;
    };

    setStage(prev => updateStage(prev));
  }, [player, resetPlayer]);

  return [stage, setStage, rowsCleared];
};
