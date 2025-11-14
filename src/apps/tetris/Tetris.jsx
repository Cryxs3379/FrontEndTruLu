import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

import { createStage } from './utils/createStage';
import { checkCollision } from './utils/checkCollision';
import { usePlayer } from './kooks/usePlayer';
import { useStage } from './kooks/useStage';

import GameBoard     from './components/GameBoard';
import ScorePanel    from './components/ScorePanel';
import TouchControls from './components/TouchControls';
import Leaderboard   from './components/Leaderboard';

import ScoreModal               from './components/ScoreModal';
import { saveScore }            from './api/apitetris';

/* ---------- estilos ---------- */
const Wrapper = styled.div`
  background-image: url('/images/tetrisbackground.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 768px) { padding: 1rem; }
`;

// Contenedor principal
const GameArea = styled.div`
  display: flex;
  flex-wrap: wrap;            /* deja que el teclado táctil baje de línea */
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 100vw;
  overflow-x: auto;           /* 🛡️ evita overflow horizontal */

  & > * {
    min-width: 0;
    flex-shrink: 1;
  }
`;

// NUEVO: agrupa tablero + panel en la misma fila y evita que hagan wrap entre sí
const GameRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-wrap: nowrap;          /* lo importante: no se separan */
`;


/* ----------------------------- */
const Tetris = () => {
  /* estado general */
  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [savingScore, setSavingScore] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  const [leaderboardRefreshToken, setLeaderboardRefreshToken] = useState(0);

  /* jugador */
  const [
    player, updatePlayerPos, resetPlayer,
    playerRotate, nextTetromino,
  ] = usePlayer();

  const playerRef = useRef(player);
  const lockStartRef = useRef(null);
  useEffect(() => { playerRef.current = player; }, [player]);

  /* tablero y score */
  const [dropTime, setDropTime] = useState(1000);
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const linePoints = [0, 40, 100, 300, 1200];

  const getLockDelay = () => Math.max(100, dropTime);

  const movePlayer = dir => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const playerRotateWithNoReset = (stg, dir) => {
    playerRotate(stg, dir);
  };

  const drop = () => {
    const current = playerRef.current;
    if (!checkCollision(current, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
      lockStartRef.current = null;
    } else {
      if (lockStartRef.current === null) {
        lockStartRef.current = Date.now();
        return;
      }
      if (Date.now() - lockStartRef.current < getLockDelay()) return;

      if (current.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return;
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
      lockStartRef.current = null;
    }
  };
  const dropPlayer = () => drop();

  useEffect(() => {
    if (rowsCleared > 0) {
      const totalLines = lines + rowsCleared;
      const nextLevel = Math.floor(totalLines / 10);
      if (nextLevel > level) {
        setLevel(nextLevel);
        setDropTime(Math.max(100, 1000 - nextLevel * 100));
      }
      const idx = Math.min(rowsCleared, linePoints.length - 1);
      setScore(prev => prev + linePoints[idx] * (level + 1));
      setLines(totalLines);
    }
  }, [rowsCleared]);

  const handleKey = useCallback(({ keyCode }) => {
    if (!gameOver && gameStarted && !paused) {
      if (keyCode === 37) movePlayer(-1);
      else if (keyCode === 39) movePlayer(1);
      else if (keyCode === 40) dropPlayer();
      else if (keyCode === 38) playerRotateWithNoReset(stage, 1);
    }
  }, [gameOver, gameStarted, paused, stage]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handleStart = () => {
    setGameStarted(true);
    setPaused(false);
    setGameOver(false);
    setDropTime(1000);
    setScore(0);
    setLines(0);
    setLevel(0);
    setScoreSaved(false);
    setScoreError(null);
    lockStartRef.current = null;
    resetPlayer();
    setStage(createStage());
  };

  useEffect(() => {
    if (gameOver && score >= 100 && !scoreSaved) {
      setShowModal(true);
    }
  }, [gameOver, score, scoreSaved]);

  const handleGuardarPuntuacion = async (username) => {
    if (!username) return;
    try {
      setSavingScore(true);
      setScoreError(null);
      await saveScore(username, score);
      setScoreSaved(true);
      setShowModal(false);
      setLeaderboardRefreshToken((prev) => prev + 1);
    } catch (error) {
      console.error('❌ Error al guardar puntuación', error);
      setScoreError('Error al guardar la puntuación. Intenta de nuevo.');
    }
    setSavingScore(false);
  };

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  return (
    <Wrapper>
      <GameArea>
        <GameRow>
          {/* 1. Tablero de juego */}
          {gameStarted && (
            <GameBoard
              player={player}
              level={level}
              setGameOver={setGameOver}
              updatePlayerPos={updatePlayerPos}
              stage={stage}
              dropTime={dropTime}
              gameStarted={gameStarted}
              paused={paused}
              setDropTime={setDropTime}
              playerRef={playerRef}
              lockStartRef={lockStartRef}
            />
          )}
  
          {/* 2. Panel de puntuación / pieza siguiente */}
          <ScorePanel
            gameStarted={gameStarted}
            gameOver={gameOver}
            paused={paused}
            score={score}
            lines={lines}
            level={level}
            nextTetromino={nextTetromino}
            handleStart={handleStart}
            setPaused={setPaused}
          />
        </GameRow>
  
        {/* 3. Teclado táctil (se coloca debajo al hacer wrap) */}
        {gameStarted && (
          <TouchControls
            movePlayer={movePlayer}
            playerRotate={playerRotateWithNoReset}
            dropPlayer={dropPlayer}
            stage={stage}
          />
        )}
      </GameArea>
  
      {!gameStarted && <Leaderboard refreshToken={leaderboardRefreshToken} />}
  
      {showModal && (
        <ScoreModal
          score={score}
          onSave={handleGuardarPuntuacion}
          loading={savingScore}
          errorMessage={scoreError}
        />
      )}
    </Wrapper>
  );
  
};

export default Tetris;