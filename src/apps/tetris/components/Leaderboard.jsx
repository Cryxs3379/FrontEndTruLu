// src/apps/tetris/components/Leaderboard.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { getLeaderboard } from '../api/apitetris';

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

const Leaderboard = ({ refreshToken = 0 }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchScores = async () => {
      console.log('🎮 [Leaderboard] useEffect ejecutado, refreshToken:', refreshToken);
      setLoading(true);
      setError(null);
      console.log('🔄 [Leaderboard] Iniciando carga de scores...');
      
      try {
        const data = await getLeaderboard();
        console.log('📦 [Leaderboard] Datos recibidos del API:', data);
        console.log('📦 [Leaderboard] Tipo de datos:', Array.isArray(data) ? 'Array' : typeof data);
        
        if (isMounted) {
          const slicedData = Array.isArray(data) ? data.slice(0, 10) : [];
          console.log('✅ [Leaderboard] Actualizando scores con:', slicedData);
          console.log('✅ [Leaderboard] Cantidad de scores a mostrar:', slicedData.length);
          setScores(slicedData);
        } else {
          console.warn('⚠️ [Leaderboard] Componente desmontado, no actualizando estado');
        }
      } catch (err) {
        console.error('❌ [Leaderboard] Error al obtener scores:', err);
        console.error('❌ [Leaderboard] Error message:', err.message);
        console.error('❌ [Leaderboard] Error stack:', err.stack);
        console.error('❌ [Leaderboard] Error completo:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        
        if (isMounted) {
          setError('Error al cargar el ranking. Intenta de nuevo.');
          setScores([]);
          console.log('⚠️ [Leaderboard] Estado de error actualizado');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('🏁 [Leaderboard] Carga finalizada');
        }
      }
    };

    fetchScores();
    return () => {
      console.log('🧹 [Leaderboard] Cleanup: desmontando componente');
      isMounted = false;
    };
  }, [refreshToken]);

  // Log del estado actual para debugging
  console.log('🎨 [Leaderboard] Render - Estado actual:', {
    loading,
    error,
    scoresLength: scores.length,
    scores: scores
  });

  // Log antes de renderizar las entradas
  if (!loading && !error && scores.length > 0) {
    console.log('📊 [Leaderboard] Renderizando', scores.length, 'entradas');
    scores.forEach((entry, i) => {
      console.log(`📝 [Leaderboard] Entrada ${i + 1}:`, entry);
    });
  }

  return (
    <BoardContainer>
      <Title>🏆 HALL OF FAME</Title>
      {loading && <p>Cargando ranking…</p>}
      {error && <p>{error}</p>}
      {!loading && !error && scores.length === 0 && <p>No hay puntuaciones aún.</p>}
      {!loading && !error && scores.map((entry, i) => (
        <Entry key={entry.id ?? `${entry.username}-${entry.created_at}`}>
          <span>{i + 1}. {(entry.username || 'ANON').toUpperCase()}</span>
          <span>{entry.score}</span>
        </Entry>
      ))}
    </BoardContainer>
  );
};

export default Leaderboard;
