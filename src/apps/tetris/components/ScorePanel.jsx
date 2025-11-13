import React from 'react';
import styled from 'styled-components';
import NextPiece from './NextPiece';
import { MIN_PANEL } from '../utils/constants';

const PanelWrapper = styled.div`
  /* Se encoge de MIN_PANEL px hasta 200 px, nunca crece más de 200 */
  width: clamp(${MIN_PANEL}px, 24vw, 200px);
  padding: 1.25rem;
  background: linear-gradient(145deg,#1f1f1f,#2d2d2d);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,.4);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  order: 1;
  /* puede encoger (1) pero no crecer (0). El valor de base coincide con width */
  flex: 0 1 clamp(${MIN_PANEL}px, 24vw, 200px);
  min-width: 0;  /* necesario para evitar overflow en flex */

  @media (max-width: 768px) {
    width: ${MIN_PANEL}px;
    flex: 0 1 ${MIN_PANEL}px;
    padding: 0.8rem;
    gap: 0.5rem;
    font-size: 0.75rem;
    align-items: center;
  }
`;

const Button = styled.button`
  margin: 0.3rem 0.2rem;
  padding: 0.4rem 0.6rem;
  background: linear-gradient(90deg,#333,#555);
  color: #fff;
  border: 1px solid #666;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: background .3s, transform .2s;

  &:hover    { background: linear-gradient(90deg,#444,#666); transform: scale(1.03);}
  &:disabled { opacity:.5; cursor:not-allowed;}
`;

const ScorePanel = ({
  gameStarted, gameOver, paused,
  score, lines, level,
  nextTetromino,
  handleStart, setPaused,
}) => (
  <PanelWrapper>
    {!gameStarted ? (
      <Button onClick={handleStart}>▶️</Button>
    ) : (
      <>
        <NextPiece tetromino={nextTetromino} />

        <p>🎯 <strong>Score:</strong> {score}</p>
        <p>📈 <strong>Lineas:</strong> {lines}</p>
        <p>⚡ <strong>Lvl:</strong> {level}</p>

        <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap'}}>
          <Button onClick={handleStart}>🔄 reiniciar</Button>
          <Button onClick={() => setPaused(p=>!p)} disabled={gameOver}>
            {paused ? '▶️ reanudar' : '⏸️ pausa'}
          </Button>
        </div>
      </>
    )}
  </PanelWrapper>
);

export default ScorePanel;