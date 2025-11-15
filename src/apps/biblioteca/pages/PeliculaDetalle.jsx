import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavbarBiblioteca from '../layout/NavbarBiblioteca';
import { getPeliculas, streamPelicula } from '../api/api';
import { useAuth } from '../../../context/AuthContext';

const PeliculaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pelicula, setPelicula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const peliculas = await getPeliculas({ signal: controller.signal });
        const peli = peliculas.find((p) => `${p.id}` === id);
        if (isMounted) {
          if (!peli) {
            setError('Película no encontrada');
          }
          setPelicula(peli ?? null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error buscando película', err);
        if (isMounted) setError('No pudimos cargar la información.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handlePlay = async () => {
    if (!pelicula) return;

    try {
      setStreaming(true);
      setStreamError(null);
      const blob = await streamPelicula(pelicula.id);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Error reproduciendo película', err);
      setStreamError('No se pudo reproducir esta película.');
    } finally {
      setStreaming(false);
    }
  };

  if (loading) {
    return (
      <>
        {usuario && <NavbarBiblioteca />}
        <p className="p-4">Cargando...</p>
      </>
    );
  }

  if (error || !pelicula) {
    return (
      <>
        {usuario && <NavbarBiblioteca />}
        <div className="container py-4">
          <div className="alert alert-warning d-flex justify-content-between align-items-center">
            <span>{error || 'Película no disponible.'}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
              Volver
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {usuario && <NavbarBiblioteca />}
      <div className="container my-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-link text-decoration-none mb-3"
          >
            ⬅️ Volver
          </button>

          <div className="row">
            <div className="col-md-5">
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
                  borderRadius: '16px',
                  minHeight: '280px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1.5rem',
                  color: '#fff',
                }}
              >
                <div>
                  <span style={{ opacity: 0.8 }}>{pelicula.year || 'Sin año'}</span>
                  <h3 className="mt-2">{pelicula.title}</h3>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                    {pelicula.filename}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-7">
              <h2 className="mb-3">{pelicula.title}</h2>
              <p><strong>Archivo:</strong> {pelicula.filename}</p>
              <p><strong>Tamaño:</strong> {Math.round(pelicula.size / (1024 * 1024))} MB</p>
              <p><strong>Fecha de alta:</strong> {new Date(pelicula.created_at).toLocaleString()}</p>

              <button
                className="btn btn-primary btn-lg mt-3"
                onClick={handlePlay}
                disabled={streaming}
              >
                {streaming ? 'Preparando video…' : '▶️ Reproducir'}
              </button>
              {streamError && <div className="alert alert-danger mt-3">{streamError}</div>}
            </div>
          </div>
        </div>

        {videoUrl && (
          <div className="mt-4 card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Reproduciendo ahora</h5>
              <video key={videoUrl} src={videoUrl} controls className="w-100" style={{ borderRadius: '12px' }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PeliculaDetalle;
