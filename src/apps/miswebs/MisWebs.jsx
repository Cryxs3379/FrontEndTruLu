import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const MisWebs = () => {
  const wordpressSites = [
    "https://www.sinlag.es",
    "https://www.mvhairstudio.es",
    "https://www.alnekoabogados.es",   
    "https://www.clubderugbyvictoriano.es",
    "https://www.vabalounge.com",
    "https://www.designyourstyle.es/",
    "https://www.yellowfy.es/"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSite = wordpressSites[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? wordpressSites.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === wordpressSites.length - 1 ? 0 : prev + 1));
  };

  const openSite = () => {
    window.open(currentSite, "_blank");
  };

  return (
    <div className="container mt-4 text-center">
      <h1 className="mb-4">Mis Sitios WordPress</h1>

      {/* Tarjetas slider */}
      <div className="d-flex overflow-auto mb-4 pb-2" style={{ gap: '1rem' }}>
        {wordpressSites.map((site, index) => (
          <div
            key={index}
            className={`web-card card text-center shadow-sm ${index === currentIndex ? "selected" : ""}`}
            style={{ minWidth: "180px", cursor: "pointer", border: "2px solid transparent" }}
            onClick={() => setCurrentIndex(index)}
          >
            <div className="card-body p-3">
              <h6 className="card-title mb-0">{new URL(site).hostname}</h6>
            </div>
          </div>
        ))}
      </div>

      {/* IFRAME */}
      <div className="mb-4" style={{
        maxWidth: "100%",
        minWidth: "300px",
        width: "90vw",
        height: "60vh",
        margin: "0 auto",
        border: "2px solid #ccc",
        borderRadius: "10px",
        overflow: "hidden"
      }}>
        <iframe
          src={currentSite}
          title={`Web: ${currentSite}`}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </div>

      {/* BOTONES */}
      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
        <button onClick={goToPrevious} className="btn btn-primary px-4">
          ⬅ Página anterior
        </button>
        <button onClick={openSite} className="btn btn-success px-4">
          🌐 Visitar sitio
        </button>
        <button onClick={goToNext} className="btn btn-primary px-4">
          Siguiente página ➡
        </button>
      </div>

      <p><strong>{currentSite}</strong></p>

      {/* Estilos extra personalizados */}
      <style>{`
        .web-card {
          background-color: #f5f9ff;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
          border-radius: 10px;
        }

        .web-card:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
        }

        .web-card.selected {
          border: 2px solid #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MisWebs;
