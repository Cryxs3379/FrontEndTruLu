import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import NavbarBiblioteca from '../layout/NavbarBiblioteca';
import { getPeliculas } from '../api/api';

const MeGustan = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const likes = usuario?.peliculaslike || [];
  const [catalogo, setCatalogo] = useState([]);

  useEffect(() => {
    const fetchCatalogo = async () => {
      const data = await getPeliculas();
      setCatalogo(data);
    };
    fetchCatalogo();
  }, []);

  return (
    <div>
      {usuario && <NavbarBiblioteca />}
      <div className="container py-4">
        <h2 className="mb-4">🎬 Películas que me gustan</h2>
        {likes.length === 0 ? (
          <p>No has dado like a ninguna película todavía.</p>
        ) : (
          <div className="row g-4">
            {likes.map((pelicula, i) => {
              // Filtrar similares de la película actual
              const similares = pelicula.similares
                ? catalogo.filter(p =>
                    pelicula.similares.includes(p.nombre)
                  ).slice(0, 3)
                : [];

              return (
                <div className="col-12" key={pelicula._id || i}>
                  <div className="row">
                    {/* Película principal */}
                    <div className="col-12 col-md-4 mb-3">
                      <MovieCard pelicula={pelicula} />
                    </div>

                    {/* Sección de recomendaciones */}
                    {similares.length > 0 && (
                      <div className="col-12 col-md-8">
                        <h5 className="mb-3">🎬 También recomendamos:</h5>
                        <div className="row">
                          {similares.map(similar => (
                            <div
                              className="col-12 col-sm-6 col-md-4 mb-3"
                              key={similar._id}
                            >
                              <MovieCard pelicula={similar} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeGustan;
