import React from 'react';
import { useNavigate } from 'react-router-dom';
import { likePelicula, removeLike } from '../api/api';

const MovieCard = ({ pelicula }) => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const likes = usuario?.peliculaslike || [];
  const yaLeGusta = likes.some(p => p._id === pelicula._id);

  const handleClickDetalle = () => {
    navigate(`/pelicula/${pelicula._id}`);
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation();

    try {
      let updatedUser;
      if (yaLeGusta) {
        updatedUser = await removeLike(usuario._id, pelicula);
      } else {
        updatedUser = await likePelicula(usuario._id, pelicula);
      }

      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      window.location.reload(); // hasta implementar estado global
    } catch (err) {
      console.error('❌ Error al actualizar like:', err);
    }
  };

  return (
    <div
      className="card h-100 shadow-sm"
      style={{ cursor: 'pointer' }}
      onClick={handleClickDetalle}
    >
      <img
        src={pelicula.imagen}
        alt={pelicula.nombre}
        className="card-img-top"
        style={{
          width: '70%',
          display: 'block',
          margin: '0 auto',
          borderRadius: '10px 10px 0 0',
        }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{pelicula.nombre}</h5>
        <p className="card-text text-muted"><em>Haz clic para ver más</em></p>
        <button
          onClick={handleLikeToggle}
          type="button"
          className={`btn mt-auto ${yaLeGusta ? 'btn-danger' : 'btn-success'}`}
        >
          {yaLeGusta ? '💔 Quitar de Me gusta' : '❤️ Me gusta'}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
