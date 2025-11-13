import React from 'react';
import styled from 'styled-components';
import { CELL_SIZE } from '../utils/constants';
import Cell from './Cell';
import { TETROMINOS } from '../utils/tetrominos';

const Wrapper = styled.div`
  display: inline-block;
  margin-left: 1rem;
  h3 { color: #fff; margin: 0 0 .25rem 0; font-size: 0.9rem; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-rows:    ${({ rows }) => `repeat(${rows}, ${CELL_SIZE})`};
  grid-template-columns: ${({ cols }) => `repeat(${cols}, ${CELL_SIZE})`};
`;

const NextPiece = ({ tetromino }) => (
  <Wrapper>
    <h3>Next</h3>
    <Grid rows={tetromino.shape.length} cols={tetromino.shape[0].length}>
      {tetromino.shape.map((row, y) =>
        row.map((cell, x) => {
          const type  = cell || 0;
          const color = TETROMINOS[type]?.color || '0, 0, 0';
          return <Cell key={`${y}-${x}`} type={type} color={color} />;
        })
      )}
    </Grid>
  </Wrapper>
);

export default NextPiece;
