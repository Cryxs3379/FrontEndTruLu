import React from 'react';
import NavbarBiblioteca from '../layout/NavbarBiblioteca';
import { useAuth } from '../../../context/AuthContext';

const MeGustan = () => {
  const { usuario } = useAuth();

  return (
    <div>
      {usuario && <NavbarBiblioteca />}
      <div className="container py-5">
        <h2 className="mb-3">❤️ Mis Favoritos</h2>
        <p className="lead">
          La nueva lista de favoritos estará disponible próximamente. Mientras tanto, puedes explorar todo el
          catálogo y reproducir tus películas favoritas desde la sección Biblioteca.
        </p>
        <p className="text-muted">
          Gracias por tu paciencia mientras migramos a la nueva API multimedia.
        </p>
      </div>
    </div>
  );
};

export default MeGustan;
