import React from 'react';

const Informacion = () => {
  return (
    <div className="bg-white text-dark py-5 px-4" style={{ fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` }}>
      <div className="container">
        <h2 className="mb-4 text-center text-md-start">Solución Integral para la Gestión de Rent a Car</h2>

        <p className="lead" style={{ lineHeight: '1.8rem', fontSize: '1.05rem', color: '#333' }}>
          Esta aplicación ha sido desarrollada para cubrir de manera integral todos los procesos críticos que intervienen en un negocio de alquiler de vehículos, desde la primera toma de contacto con el cliente hasta la planificación operativa del personal. Su objetivo es digitalizar, simplificar y automatizar tareas clave para maximizar la eficiencia, reducir errores y mejorar la experiencia del cliente.
        </p>

        <h4 className="mt-4 text-primary">🧾 Gestión de Reservas</h4>
        <p style={{ lineHeight: '1.8rem', fontSize: '1rem', color: '#555' }}>
          El sistema permite registrar rápidamente nuevas reservas mediante un formulario optimizado. Cada reserva incluye información clave del cliente (nombre, contacto, DNI), así como los detalles de la categoría de vehículo seleccionada, las fechas y horas de recogida y devolución. Esto garantiza un control preciso sobre la planificación de la flota.
        </p>

        <h4 className="mt-4 text-primary">🏢 Control desde Oficina</h4>
        <p style={{ lineHeight: '1.8rem', fontSize: '1rem', color: '#555' }}>
          Desde el módulo de oficina, el personal puede gestionar reservas pendientes, editar los datos ingresados por el cliente, confirmar reservas, y asignar vehículos disponibles. Esta confirmación transfiere automáticamente la reserva al listado de clientes activos, indicando que el coche ya está comprometido y evitando solapamientos.
        </p>
        <p style={{ lineHeight: '1.8rem', fontSize: '1rem', color: '#555' }}>
          Además, se dispone de controles para eliminar registros, lo cual resulta útil en caso de cancelaciones o errores. Todo el proceso se ha pensado para facilitar una operativa limpia y directa con una mínima curva de aprendizaje.
        </p>


        <h4 className="mt-4 text-primary">📊 Visibilidad Total sobre Clientes y Flota</h4>
        <p style={{ lineHeight: '1.8rem', fontSize: '1rem', color: '#555' }}>
          El panel de clientes ofrece una visión clara y ordenada de todos los usuarios con una reserva activa, incluyendo el coche asignado, fechas de uso y coste por día. Esta vista permite tomar decisiones rápidas y coordinadas entre los diferentes miembros del equipo.
        </p>

        <h4 className="mt-4 text-primary">👨‍🔧 Organización del Trabajo Interno</h4>
        <p style={{ lineHeight: '1.8rem', fontSize: '1rem', color: '#555' }}>
          Uno de los principales beneficios de la plataforma es su capacidad para organizar el trabajo interno. Al conocer con antelación qué coches deben estar listos y a qué hora, los operarios de limpieza, mantenimiento o entrega pueden planificarse con exactitud, evitando retrasos y conflictos. Esto mejora la puntualidad en las entregas y la satisfacción del cliente final.
        </p>

        <h4 className="mt-4 text-primary">🔐 Seguridad y Escalabilidad</h4>
        <p style={{ lineHeight: '1.8rem', fontSize: '1rem', color: '#555' }}>
          La arquitectura del sistema está pensada para escalar fácilmente y adaptarse a cualquier tamaño de negocio, desde pequeños rent a car locales hasta flotas más grandes. La conexión con backend a través de API REST permite una separación clara entre lógica de negocio y presentación, facilitando futuras integraciones (por ejemplo, pasarelas de pago, sistemas GPS o herramientas de facturación).
        </p>

        <h4 className="mt-4 text-primary">🚀 En constante evolución</h4>
        <p style={{ lineHeight: '1.8rem', fontSize: '1rem', color: '#555' }}>
          Esta plataforma está construida con tecnologías modernas como React y Material UI, permitiendo una interfaz limpia, rápida y responsiva. Cada componente ha sido diseñado para ser reutilizable y mantener buenas prácticas de desarrollo. Además, su estructura modular facilita futuras ampliaciones como paneles de estadísticas, gestión de mantenimiento, informes PDF o incluso conexión con IA para predicción de demanda.
        </p>

        <hr className="my-5" />

        <p className="text-center text-muted fst-italic" style={{ fontSize: '0.95rem' }}>
          Esta herramienta representa una solución sólida y escalable para empresas del sector de alquiler de vehículos que buscan digitalizar su operativa y mejorar la eficiencia de su equipo.
        </p>
      </div>
    </div>
  );
};

export default Informacion;
