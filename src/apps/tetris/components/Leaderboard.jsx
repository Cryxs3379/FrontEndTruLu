// src/apps/tetris/components/Leaderboard.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { fetchLeaderboard } from '../api/apitetris';

// ✨ Animación de brillo
const glow = keyframes`
  0% { text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff; }
  50% { text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff; }
  100% { text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff; }
`;

const BoardContainer = styled.div`
  margin-top: 2rem;
  background: rgba(10, 10, 30, 0.9);
  padding: 1rem 1.5rem;
  border: 2px solid #00ffff;
  border-radius: 12px;
  color: #00ffff;
  max-width: 400px;
  width: 100%;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  box-shadow: 0 0 15px #00ffff;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1rem;
  color: #00ffff;
  animation: ${glow} 2s ease-in-out infinite;
  border-bottom: 1px dashed #00ffff;
  padding-bottom: 0.5rem;
`;

const Entry = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px dashed #00ffff;

  &:last-child {
    border-bottom: none;
  }

  span {
    color: #fff;
    text-shadow: 0 0 2px #0ff;
  }
`;

const Leaderboard = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const data = await fetchLeaderboard();
        setScores(data.slice(0, 10));
      } catch (err) {
        console.error('Error fetching scores:', err);
      }
    };

    fetchScores();
  }, []);

  return (
    <BoardContainer>
      <Title>🏆 HALL OF FAME</Title>
      {scores.map((entry, i) => (
        <Entry key={entry.id ?? `${entry.username}-${entry.created_at}`}>
          <span>{i + 1}. {(entry.username || 'ANON').toUpperCase()}</span>
          <span>{entry.score}</span>
        </Entry>
      ))}
    </BoardContainer>
  );
};

export default Leaderboard;
