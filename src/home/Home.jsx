import React from 'react';

const Home = () => {
  return (
    <div className="min-vh-100 text-light" style={{ backgroundColor: '#111', fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` }}>
      {/* SECCIÓN PRINCIPAL */}
      <div className="container py-5">
        <div className="row justify-content-center align-items-center g-4">
          <div className="col-md-6 d-flex flex-column justify-content-center">
            <h1 className="display-4 text-white mb-4 text-center text-md-start">
              Bienvenido<span style={{ color: '#f5d76e' }}>.</span>
            </h1>
            <p className="lead mb-3 text-center text-md-start">
              Mi nombre es <strong>Pedro Trujillo Lucena</strong>, desarrollador Fullstack especializado en soluciones inteligentes con base en Málaga, España.
            </p>
            <p className="text-center text-md-start">
            Soy un Ingeniero de TI con Grado Superior en Administración de Sistemas Informáticos en Red y más de cuatro años de experiencia diseñando, construyendo y desplegando soluciones inteligentes orientadas a negocio. Combino un sólido dominio del stack MERN y de la ingeniería de datos con un enfoque estratégico en RPA e Inteligencia Artificial para optimizar procesos críticos, reducir costes y acelerar la toma de decisiones. Mi trayectoria incluye la implementación de bots con UiPath, modelos generativos con GPT-4 y DALL·E, y sistemas predictivos basados en TensorFlow y PyTorch. Hablo español nativo e inglés B2, lo que me permite colaborar eficazmente con equipos internacionales.
            </p>
          </div>

          <div className="col-md-6 text-center">
      <img
  src="/images/TrujilloLucena.png"
  alt="Pedro Trujillo Lucena"
  style={{
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    border: '2px solid #f5d76e',
    objectFit: 'cover',
    marginBottom: '1.5rem'
  }}
/>

            <div>
              <h2 className="text-warning mb-1">Pedro Trujillo Lucena</h2>
              <p>Málaga, España</p>
              <p>
                📞 <a href="https://wa.me/34675034328" className="text-warning text-decoration-none" target="_blank" rel="noopener noreferrer">+34 675 034 328</a>
              </p>
              <p>
                ✉️ <a href="mailto:pedrotl3379@gmail.com" className="text-warning text-decoration-none">pedrotl3379@gmail.com</a>
              </p>
              <p>
                🔗 <a href="https://linkedin.com/in/pedrotrujillolucena" target="_blank" rel="noopener noreferrer" className="text-warning">LinkedIn</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO COMPLETO ANCHO */}
      <section className="container py-4">
        <div>
          <h3 className="text-warning mt-4">Desarrollo Full-Stack</h3>
          <p>
          Diseñar e implementar aplicaciones con React + Node (stack MERN), aplicando principios SOLID y Clean Architecture para mantener un código limpio y escalable.
          </p>
          <p>
          Desarrollar APIs REST y GraphQL versionadas y documentadas (Swagger/OpenAPI) con autenticación segura (JWT, OAuth 2.0).
           </p>
           <p>
           Integrar pruebas automatizadas (Jest, React Testing Library, Supertest) y establecer pipelines CI/CD que garanticen despliegues fiables y sin tiempo de inactividad.
           </p>
           <p>
           Optimizar rendimiento mediante lazy loading, code-splitting y consultas indexadas; contenedorización con Docker y despliegue en AWS, Azure o GCP.
           </p>
           
          <h3 className="text-warning mt-4">Automatización & RPA</h3>
          <p>
          Construir robots UiPath (Studio, REFramework, Orchestrator) capaces de eliminar entre un 40 % y un 70 % de tareas manuales en procesos financieros, académicos y de soporte.
          </p>
          <p>
          Mapear flujos con BPMN en Bizagi, identificar cuellos de botella y estimar el ROI antes de automatizar.
          </p>
          <p>
          Habilitar bots para interactuar con APIs, ERP/CRM y bases de datos, gestionando colas y re-intentos de forma resiliente.
          </p>
          <p>
          Automatizar reporting ofimático mediante VBA y Power Query, generando dashboards y análisis en minutos.
          </p>

          <h3 className="text-warning mt-4">IA & Data Science</h3>
          <p>
          Desarrollar soluciones basadas en GPT-4, DALL·E y MidJourney para chatbots, creación de contenido y personalización, logrando incrementos de productividad  50 %.
           </p>
           <p>
           Diseñar y entrenar modelos de clasificación, regresión y clustering con TensorFlow, PyTorch y scikit-learn; optimizar métricas AUC, F1 y MAE.
           </p>
           <p>
           Aplicar prácticas de MLOps: versionado de datos y modelos, monitorización de drift y re-entrenos automáticos.
           </p>
           <p>
           Presentar hallazgos en Power BI, transformando datos complejos en insights accionables para la dirección.
           </p>

          <h3 className="text-warning mt-4">Bases de Datos</h3>
          <p>
          Diseñar esquemas avanzados en MySQL 8 , MariaDB,  MongoDB,  SupaBase: normalización, índices compuestos y particionamiento para mantener latencias menores a 100 ms.
           </p>
           <p>
           Encapsular reglas de negocio mediante triggers, procedimientos, funciones y vistas, reforzando seguridad e integridad.
           </p>
           <p>
           Gestionar replicación, backups continuos y planes de recuperación; aplicar cifrado TLS/TDE y políticas GDPR.
           </p>
           <p>
           Liderar migraciones de entornos on-premise a cloud con tuning de rendimiento y auditorías completas.
           </p>

          <h3 className="text-warning mt-4">DevOps & CI/CD</h3>
          <p>
          Adoptar GitFlow o trunk-based según el proyecto, exigiendo code reviews y checks automáticos de linting y tests en cada commit.
           </p>
      

          <h3 className="text-warning mt-4">Reporting & BI</h3>
          <p>
          Dominar Excel avanzado: tablas dinámicas, Power Query, Solver y macros para modelar escenarios y automatizar informes.
           </p>
           <p>
           Crear dashboards en Power BI de extremo a extremo (ETL, modelado DAX, RLS) con actualizaciones programadas.
           </p>
           <p>
           Conectar múltiples fuentes (SQL, APIs, archivos planos) y orquestar flujos de datos consistentes y auditables.
           </p>
           <p>
           Diseñar visualizaciones siguiendo buenas prácticas para destacar KPIs clave y respaldar decisiones estratégicas.
           </p>
        </div>
      </section>

      {/* IDIOMAS */}
      <section className="container my-4">
        <h2 className="text-warning fs-4 mb-3">Idiomas</h2>
        <ul className="list-unstyled">
          <li>Español: Nativo</li>
          <li>Inglés: Nivel B2 (lectura, escritura y comunicación técnica)</li>
        </ul>
      </section>

      {/* EXPERIENCIAS */}
      <section className="container my-4">
        <h3 className="text-warning mt-4">Implementación de Modelos de IA Generativa</h3>
        <ul className="list-unstyled">
          <li>Desarrollo de soluciones inteligentes con OpenAI GPT, DALL·E y MidJourney.</li>
          <li>Automatización de atención al cliente mediante asistentes virtuales.</li>
          <li>Personalización de contenido para campañas digitales.</li>
          <li>Integración de APIs con validación avanzada y post-procesamiento.</li>
        </ul>

        <h3 className="text-warning mt-4">Automatización Inteligente de Procesos</h3>
        <ul className="list-unstyled">
          <li>Implementación de bots con UiPath y VBA para tareas repetitivas.</li>
          <li>Modelado de procesos en Bizagi y aplicación de BPMN.</li>
          <li>Automatización de reportes financieros, académicos y administrativos.</li>
          <li>Conexión con ERP y generación de informes dinámicos.</li>
        </ul>

        <h3 className="text-warning mt-4">Análisis Predictivo y Data Science</h3>
        <ul className="list-unstyled">
          <li>Desarrollo de modelos predictivos con scikit-learn y TensorFlow.</li>
          <li>Segmentación de clientes, forecasting y análisis de tendencias.</li>
          <li>Visualización de datos en Power BI y toma de decisiones basadas en métricas.</li>
          <li>Aplicación de técnicas de regresión, clustering y árboles de decisión.</li>
        </ul>
      </section>

      <footer className="text-end text-muted small py-4 px-3">
        ©2024 pedrotrujillo.dev
      </footer>
    </div>
  );
};


const paragraph = {
  lineHeight: '1.8rem',
  fontSize: '1rem',
  color: '#ccc',
};

const list = {
  lineHeight: '1.8rem',
  color: '#ccc',
};

export default Home;
