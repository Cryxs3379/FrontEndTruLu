import React, { useEffect, useState } from 'react';
import { getPeliculas } from '../api/api';
import MovieCard from '../components/MovieCard';
import NavbarBiblioteca from '../layout/NavbarBiblioteca';

const Biblioteca = () => {
  const [peliculas, setPeliculas] = useState([]);
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchPeliculas = async () => {
      const data = await getPeliculas();
      setPeliculas(data);
    };
    fetchPeliculas();
  }, []);

  return (
    <div>
      {usuario && <NavbarBiblioteca />} {/* navbar local visible solo logueado */}

      <div className="container py-4">
        <h2 className="mb-4">Biblioteca de Películas</h2>
        <div className="row g-4">
          {peliculas.map(p => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p._id}>
              <MovieCard pelicula={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Biblioteca;
