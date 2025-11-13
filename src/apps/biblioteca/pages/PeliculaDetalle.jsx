import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPeliculas } from '../api/api';
import NavbarBiblioteca from '../layout/NavbarBiblioteca';

const PeliculaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pelicula, setPelicula] = useState(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchData = async () => {
      const peliculas = await getPeliculas();
      const peli = peliculas.find(p => p._id === id);
      setPelicula(peli);
    };
    fetchData();
  }, [id]);

  if (!pelicula) return <p className="p-4">Cargando...</p>;

  const enlaceGoogle = `https://www.google.com/search?q=dónde+ver+${encodeURIComponent(pelicula.nombre)}`;

  const toggleOpciones = () => {
    setMostrarOpciones(!mostrarOpciones);
  };

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

          <div className="row align-items-start">
            {/* Imagen de la película */}
            <div className="col-md-4 text-center">
              <img
                src={pelicula.imagen}
                alt={pelicula.nombre}
                className="img-fluid rounded mb-3"
                style={{
                  maxHeight: '400px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              />
            </div>

            {/* Información de la película */}
            <div className="col-md-8">
              <h2
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  marginBottom: '1rem'
                }}
              >
                {pelicula.nombre}
              </h2>

              <p
                style={{
                  fontSize: '1.4rem',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}
              >
                <strong>Sinopsis:</strong> {pelicula.sinopsis}
              </p>

              <p
                style={{
                  fontSize: '1.1rem',
                  marginBottom: '2rem'
                }}
              >
                <strong>Fecha de creación:</strong>{' '}
                {new Date(pelicula.fecha_creacion).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Botón "Dónde ver" abajo y centrado */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary btn-lg px-5 py-3"
            onClick={toggleOpciones}
            aria-expanded={mostrarOpciones}
          >
            📺 Dónde ver
          </button>
        </div>

        {/* Sección de opciones */}
        {mostrarOpciones && (
          <div className="bg-white p-4 rounded shadow-sm mt-3">
            <div className="bg-light p-3 rounded mb-3">
              <strong>Ver legalmente:</strong>{' '}
              <a
                href={enlaceGoogle}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm ms-2"
              >
                Buscar en Google
              </a>
            </div>

            <div className="bg-light p-3 rounded">
              <strong>Ver menos legalmente:</strong>
              <pre className="mt-2">
                {JSON.stringify(pelicula.ver_menos_legalmente, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PeliculaDetalle;
