//usePlayer.jsx
import { useState, useCallback } from 'react';
import { TETROMINOS, randomTetromino } from '../utils/tetrominos';
import { STAGE_WIDTH } from '../utils/createStage';
import { checkCollision } from '../utils/checkCollision';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: randomTetromino().shape,
    collided: false,
  });

  const [nextTetromino, setNextTetromino] = useState(randomTetromino());

  const updatePlayerPos = ({ x, y, collided }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  };

  const rotate = (matrix, dir) => {
    const rotatedTetro = matrix.map((_, i) =>
      matrix.map(col => col[i])
    );
    return dir > 0 ? rotatedTetro.reverse() : rotatedTetro.map(row => row.reverse());
  };

  const playerRotate = (stage, dir) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        clonedPlayer.tetromino = player.tetromino;
        clonedPlayer.pos.x = pos;
        return;
      }
    }

    setPlayer(clonedPlayer);
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: nextTetromino.shape,
      collided: false,
    });
    setNextTetromino(randomTetromino());
  }, [nextTetromino]);

  return [player, updatePlayerPos, resetPlayer, playerRotate, nextTetromino];
};
