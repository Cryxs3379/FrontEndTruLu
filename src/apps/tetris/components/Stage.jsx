// Stage.jsx
// ================================

import React from 'react';
import styled from 'styled-components';
import { CELL_SIZE } from '../utils/constants';
import Cell from './Cell';
import { TETROMINOS } from '../utils/tetrominos';

const StyledStage = styled.div`
  display: grid;
  grid-template-rows: ${({ rows }) => `repeat(${rows}, ${CELL_SIZE})`};
  grid-template-columns: ${({ cols }) => `repeat(${cols}, ${CELL_SIZE})`};
  background: #111;
  border: 2px solid #333;
  min-width: calc(${CELL_SIZE} * 12);
  overflow-x: auto;
  flex: 0 1 auto;
  flex-shrink: 0;
`;

const Stage = ({ stage }) => (
  <StyledStage rows={stage.length} cols={stage[0].length}>
    {stage.map((row, y) =>
      row.map((cell, x) => {
        const cellType = cell[0];
        const color = TETROMINOS[cellType]?.color || '0, 0, 0';
        return <Cell key={`${y}-${x}`} type={cellType} color={color} />;
      })
    )}
  </StyledStage>
);

export default Stage;


// ================================ 