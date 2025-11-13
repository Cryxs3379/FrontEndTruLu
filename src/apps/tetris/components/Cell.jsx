// Cell.jsx
// ================================

import React from 'react';
import styled from 'styled-components';
import { CELL_SIZE, BORDER_EMPTY, BORDER_FILLED } from '../utils/constants';

const StyledCell = styled.div`
  width: ${CELL_SIZE};
  height: ${CELL_SIZE};
  background: ${({ color, type }) => `rgba(${color}, ${type === 0 ? 0.05 : 1})`};
  border: ${({ type }) => (type === 0 ? BORDER_EMPTY : BORDER_FILLED)};
  box-sizing: border-box;
  transition: all 0.2s ease;
`;

const Cell = ({ type, color }) => <StyledCell type={type} color={color} />;

export default React.memo(Cell);
