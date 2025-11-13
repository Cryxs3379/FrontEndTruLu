// TouchControls.jsx (MODIFICADO)
// ================================

import React, { useCallback } from 'react';
import styled from 'styled-components';

const ControlsWrapper = styled.div`
  display: none;
  order: 2;
  flex-basis: 100%;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;

    button {
      padding: 1rem;
      font-size: 1.4rem;
      background: #222;
      color: #fff;
      border: 1px solid #444;
      border-radius: 6px;
      min-width: clamp(60px, 18vw, 90px);
      font-weight: bold;
      cursor: pointer;
      touch-action: manipulation;
    }
  }
`;

const TouchControls = ({ movePlayer, playerRotate, dropPlayer, stage }) => {
  const press = useCallback((fn) => (e) => {
    e.preventDefault();
    fn();
  }, []);

  return (
    <ControlsWrapper>
      <button onPointerDown={press(() => movePlayer(-1))}>◀️</button>
      <button onPointerDown={press(() => playerRotate(stage, 1))}>🔄</button>
      <button onPointerDown={press(() => movePlayer(1))}>▶️</button>
      <button onPointerDown={press(() => dropPlayer())}>⬇️</button>
    </ControlsWrapper>
  );
};

export default TouchControls;

 