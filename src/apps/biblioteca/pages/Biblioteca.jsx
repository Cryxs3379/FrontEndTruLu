import React, { useEffect, useMemo, useState } from 'react';
import { getPeliculas, streamPelicula } from '../api/api';
import MovieCard from '../components/MovieCard';
import NavbarBiblioteca from '../layout/NavbarBiblioteca';
import { useAuth } from '../../../context/AuthContext';

const Biblioteca = () => {
  const { usuario } = useAuth();
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamingMovieId, setStreamingMovieId] = useState(null);
  const [player, setPlayer] = useState({ movie: null, url: null });
  const [streamError, setStreamError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPeliculas = async () => {
      if (!usuario?.token) {
        setLoading(false);
        setError('Debes iniciar sesión para acceder a la biblioteca.');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getPeliculas({ signal: controller.signal });
        if (isMounted) {
          setPeliculas(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error cargando películas', err);
        if (isMounted) {
          setError('No se pudieron cargar las películas. Intenta nuevamente.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPeliculas();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [usuario]);

  useEffect(() => {
    return () => {
      if (player.url) {
        URL.revokeObjectURL(player.url);
      }
    };
  }, [player.url]);

  const handlePlayMovie = async (movie) => {
    if (!usuario?.token) {
      setStreamError('Debes iniciar sesión nuevamente.');
      return;
    }

    try {
      setStreamingMovieId(movie.id);
      setStreamError(null);
      const blob = await streamPelicula(movie.id);
      const url = URL.createObjectURL(blob);
      if (player.url) URL.revokeObjectURL(player.url);
      setPlayer({ movie, url });
    } catch (err) {
      console.error('Error al reproducir película', err);
      setStreamError('No se pudo iniciar la reproducción. Intenta de nuevo.');
    } finally {
      setStreamingMovieId(null);
    }
  };

  const closePlayer = () => {
    if (player.url) URL.revokeObjectURL(player.url);
    setPlayer({ movie: null, url: null });
  };

  const emptyState = useMemo(() => !loading && !error && peliculas.length === 0, [loading, error, peliculas]);

  return (
    <div>
      {usuario && <NavbarBiblioteca />}

      <div className="container py-4">
        <h2 className="mb-4">Biblioteca de Películas</h2>

        {loading && <p>Cargando catálogo...</p>}
        {error && <div className="alert alert-warning">{error}</div>}
        {emptyState && <p>No hay películas registradas aún.</p>}

        <div className="row g-4">
          {peliculas.map((pelicula) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={pelicula.id}>
              <MovieCard
                pelicula={pelicula}
                onPlay={handlePlayMovie}
                isPlaying={streamingMovieId === pelicula.id}
              />
            </div>
          ))}
        </div>

        {player.url && (
          <div className="mt-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1">Reproduciendo: {player.movie?.title}</h5>
                    <small className="text-muted">
                      Archivo: {player.movie?.filename} · Año: {player.movie?.year ?? 'N/D'}
                    </small>
                  </div>
                  <button className="btn btn-outline-danger btn-sm" onClick={closePlayer}>
                    Cerrar reproductor
                  </button>
                </div>
                {streamError && <div className="alert alert-danger mt-3">{streamError}</div>}
                <video
                  key={player.url}
                  src={player.url}
                  controls
                  className="w-100 mt-3"
                  style={{ maxHeight: '480px', borderRadius: '12px' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Biblioteca;
