import React, { useEffect, useMemo, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import {
  getEventos,
  crearEvento,
  eliminarEvento as apiEliminarEvento,
  actualizarEvento,
  getHistorial,
  crearHistorial,
} from '../api/apiCalendario';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// ---------- utilidades de fecha ----------
const toDateTimeLocal = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
};
const toISO = (value) => new Date(value).toISOString();
const fmt = (d) => new Date(d).toLocaleString();

// ---------- hook: breakpoint responsivo ----------
const useBreakpoints = () => {
  const get = () => {
    if (typeof window === 'undefined') {
      return { xs: false, sm: false, md: false, lg: true, xl: false };
    }
    return {
      xs: window.matchMedia('(max-width: 575.98px)').matches,
      sm: window.matchMedia('(min-width: 576px) and (max-width: 767.98px)').matches,
      md: window.matchMedia('(min-width: 768px) and (max-width: 991.98px)').matches,
      lg: window.matchMedia('(min-width: 992px) and (max-width: 1199.98px)').matches,
      xl: window.matchMedia('(min-width: 1200px)').matches,
    };
  };

  const [bp, setBp] = useState(get());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setBp(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return bp;
};

const HomeCalendario = () => {
  const [eventos, setEventos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const { xs, sm, md } = useBreakpoints();
  const isCompact = xs || sm; // móviles y tablets estrechas

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userCalendario'));
    } catch {
      return null;
    }
  }, []);

  // 🔐 regla: solo edita si role === 'editor'
  const canEdit = usuario?.role === 'editor';

  const cargarEventos = useCallback(async () => {
    try {
      setLoadingEventos(true);
      const data = await getEventos();
      setEventos(
        data.map((e) => ({
          id: e._id,
          title: e.title,
          start: e.start,
          end: e.end ?? e.start,
          description: e.description,
        }))
      );
    } catch (error) {
      console.error('❌ Error al cargar eventos:', error);
      Swal.fire('Error', 'No se pudieron cargar los eventos', 'error');
    } finally {
      setLoadingEventos(false);
    }
  }, []);

  const cargarHistorial = useCallback(async () => {
    try {
      setLoadingHistorial(true);
      const data = await getHistorial();
      setHistorial(
        [...data].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      );
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
    cargarHistorial();
  }, [cargarEventos, cargarHistorial]);

  const registrarHistorial = useCallback(
    async (accion, eventoTitulo) => {
      if (!usuario) return;
      try {
        await crearHistorial({
          usuarioId: usuario.id || usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          accion,
          eventoTitulo,
        });
        cargarHistorial();
      } catch (err) {
        console.error('❌ Error al registrar historial:', err);
      }
    },
    [usuario, cargarHistorial]
  );

  const handleDateClick = useCallback(
    async (info) => {
      const defaultStart = `${info.dateStr}T09:00`;
      const defaultEnd = `${info.dateStr}T10:00`;

      const { value, isConfirmed } = await MySwal.fire({
        title: 'Crear nueva nota 📋',
        html: `
          <input id="swal-title" class="swal2-input" placeholder="Título">
          <textarea id="swal-description" class="swal2-textarea" placeholder="Descripción"></textarea>
          <input type="datetime-local" id="swal-start" class="swal2-input" value="${defaultStart}">
          <input type="datetime-local" id="swal-end" class="swal2-input" value="${defaultEnd}">
        `,
        focusConfirm: false,
        preConfirm: () => {
          const title = document.getElementById('swal-title').value.trim();
          const description = document.getElementById('swal-description').value.trim();
          const start = document.getElementById('swal-start').value;
          const end = document.getElementById('swal-end').value;
          if (!title || !start || !end) {
            Swal.showValidationMessage('Título e intervalos son obligatorios');
            return;
          }
          if (new Date(start) > new Date(end)) {
            Swal.showValidationMessage('El inicio no puede ser mayor que el fin');
            return;
          }
          return { title, description, start: toISO(start), end: toISO(end) };
        },
        showCancelButton: true,
        confirmButtonText: 'Crear',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'swal-compact' },
      });

      if (isConfirmed && value) {
        try {
          await crearEvento(value);
          await cargarEventos();
          registrarHistorial('creó el evento', value.title);
        } catch (err) {
          console.error('❌ Error al crear evento:', err);
          Swal.fire('Error', 'No se pudo crear el evento', 'error');
        }
      }
    },
    [cargarEventos, registrarHistorial]
  );

  const handleEventClick = useCallback(
    async (info) => {
      if (!canEdit) return verDetalle(info);

      const res = await MySwal.fire({
        title: `Opciones para "${info.event.title}"`,
        showCancelButton: true, // Eliminar
        showDenyButton: true, // Ver detalle
        confirmButtonText: '✏️ Editar',
        denyButtonText: '👁️ Ver detalle',
        cancelButtonText: '🗑️ Eliminar',
        reverseButtons: true,
        customClass: { popup: 'swal-compact' },
      });

      if (res.isConfirmed) {
        editarEvento(info);
      } else if (res.isDenied) {
        verDetalle(info);
      } else if (res.dismiss === Swal.DismissReason.cancel) {
        eliminarEventoClick(info);
      }
    },
    [canEdit]
  );

  const eliminarEventoClick = useCallback(
    async (info) => {
      const result = await Swal.fire({
        title: `¿Eliminar "${info.event.title}"?`,
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'swal-compact' },
      });

      if (result.isConfirmed) {
        try {
          await apiEliminarEvento(info.event.id);
          await cargarEventos();
          registrarHistorial('eliminó el evento', info.event.title);
          Swal.fire('Eliminado', 'Tu nota ha sido eliminada', 'success');
        } catch (err) {
          console.error('❌ Error al eliminar evento:', err);
          Swal.fire('Error', 'No se pudo eliminar el evento', 'error');
        }
      }
    },
    [cargarEventos, registrarHistorial]
  );

  const editarEvento = useCallback(
    async (info) => {
      const { value, isConfirmed } = await MySwal.fire({
        title: 'Editar nota 📋',
        html: `
          <input id="swal-title" class="swal2-input" placeholder="Título" value="${info.event.title}">
          <textarea id="swal-description" class="swal2-textarea" placeholder="Descripción">${
            info.event.extendedProps.description || ''
          }</textarea>
          <input type="datetime-local" id="swal-start" class="swal2-input" value="${toDateTimeLocal(
            info.event.start
          )}">
          <input type="datetime-local" id="swal-end" class="swal2-input" value="${toDateTimeLocal(
            info.event.end || info.event.start
          )}">
        `,
        focusConfirm: false,
        preConfirm: () => {
          const title = document.getElementById('swal-title').value.trim();
          const description = document.getElementById('swal-description').value.trim();
          const start = document.getElementById('swal-start').value;
          const end = document.getElementById('swal-end').value;
          if (!title || !start || !end) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return;
          }
          if (new Date(start) > new Date(end)) {
            Swal.showValidationMessage('El inicio no puede ser mayor que el fin');
            return;
          }
          return { title, description, start: toISO(start), end: toISO(end) };
        },
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'swal-compact' },
      });

      if (isConfirmed && value) {
        try {
          await actualizarEvento(info.event.id, value);
          await cargarEventos();
          registrarHistorial('modificó el evento', value.title);
          Swal.fire('¡Actualizado!', 'La nota ha sido modificada', 'success');
        } catch (err) {
          console.error('❌ Error al actualizar evento:', err);
          Swal.fire('Error', 'No se pudo actualizar el evento', 'error');
        }
      }
    },
    [cargarEventos, registrarHistorial]
  );

  const verDetalle = async (info) => {
    await Swal.fire({
      title: info.event.title,
      html: `
        <p><strong>Descripción:</strong> ${
          info.event.extendedProps.description || 'Sin descripción'
        }</p>
        <p><strong>Inicio:</strong> ${fmt(info.event.start)}</p>
        <p><strong>Fin:</strong> ${fmt(info.event.end)}</p>
      `,
      padding: '1.25em',
      background: '#fff',
      customClass: { popup: 'swal-compact' },
    });
  };

  const handleEventDrop = useCallback(
    async (info) => {
      const payload = {
        title: info.event.title,
        description: info.event.extendedProps.description,
        start: info.event.start?.toISOString(),
        end: (info.event.end || info.event.start)?.toISOString(),
      };
      try {
        await actualizarEvento(info.event.id, payload);
        await cargarEventos();
        registrarHistorial('movió el evento', info.event.title);
      } catch (err) {
        console.error('❌ Error al mover evento:', err);
        Swal.fire('Error', 'No se pudo mover el evento', 'error');
        info.revert();
      }
    },
    [cargarEventos, registrarHistorial]
  );

  const handleEventResize = useCallback(
    async (info) => {
      const payload = {
        title: info.event.title,
        description: info.event.extendedProps.description,
        start: info.event.start?.toISOString(),
        end: info.event.end?.toISOString(),
      };
      try {
        await actualizarEvento(info.event.id, payload);
        await cargarEventos();
        registrarHistorial('redimensionó el evento', info.event.title);
      } catch (err) {
        console.error('❌ Error al redimensionar evento:', err);
        Swal.fire('Error', 'No se pudo actualizar la duración', 'error');
        info.revert();
      }
    },
    [cargarEventos, registrarHistorial]
  );

  // ---------- configuración consistente + micro-ajustes móvil ----------
  const headerToolbar = { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' };
  const buttonText   = { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' };

  const dayMaxEventRows = isCompact ? 3 : 4;
  const aspectRatio     = isCompact ? 1.08 : md ? 1.15 : 1.25; // más alto en móvil para evitar scroll

  return (
    <div className="container py-3 py-md-4">
      {usuario && (
        <div
          className="d-flex flex-column flex-sm-row gap-2 justify-content-between align-items-start align-items-sm-center bg-light p-3 rounded-3 shadow-sm mb-3 mb-md-4"
          style={{ rowGap: 8 }}
        >
          <span className="fw-semibold text-wrap">
            Bienvenido {usuario.nombre} {usuario.apellido} 👋🏻
            <span className="ms-2 badge bg-secondary align-middle">Rol: {usuario.role}</span>
            {!canEdit && (
              <span className="ms-2 badge bg-warning text-dark align-middle">Solo lectura</span>
            )}
          </span>
          <button
            className="btn btn-danger btn-sm align-self-sm-auto w-100 w-sm-auto"
            onClick={() => {
              localStorage.removeItem('userCalendario');
              localStorage.removeItem('tokenCalendario');
              window.location.href = '/logincalendario';
            }}
          >
            🔒 Cerrar sesión
          </button>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch">
        {/* Calendario */}
        <section className="flex-fill bg-white rounded-3 shadow-sm p-2 p-sm-3">
          <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-2 sticky-top bg-white" style={{ top: 0, zIndex: 2 }}>
            <h2 className="h4 m-0">📅 Calendario de Eventos</h2>
            {loadingEventos && <span className="text-muted small">Cargando…</span>}
          </div>

          <div className="fc-responsive-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={headerToolbar}
              buttonText={buttonText}
              locales={[esLocale]}
              locale="es"
              height="auto"
              aspectRatio={aspectRatio}
              expandRows={true}
              contentHeight="auto"
              events={eventos}
              eventDisplay="block"
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
              dayMaxEventRows={dayMaxEventRows}
              nowIndicator={true}
              weekends={true}
              firstDay={1}
              /* permisos por rol */
              editable={canEdit}
              droppable={canEdit}
              selectable={canEdit}
              selectMirror={true}
              dateClick={canEdit ? handleDateClick : undefined}
              eventClick={handleEventClick}
              eventDrop={canEdit ? handleEventDrop : undefined}
              eventResize={canEdit ? handleEventResize : undefined}
              slotEventOverlap={false}
              dayHeaderFormat={{ weekday: isCompact ? 'short' : 'long' }}
              moreLinkClick="popover"
              handleWindowResize={true}
              windowResizeDelay={100}
            />
          </div>
        </section>

        {/* Historial */}
        <aside className="bg-white rounded-3 shadow-sm p-3" style={{ minWidth: 280, maxWidth: 420 }}>
          <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-2">
            <h3 className="h5 m-0">🕑 Historial de Acciones</h3>
            {loadingHistorial && <span className="text-muted small">Cargando…</span>}
          </div>

          <div
            className="historial-scroll pe-1"
            style={{ maxHeight: 'clamp(220px, 35vh, 420px)', overflowY: 'auto', overscrollBehavior: 'contain' }}
          >
            {historial.length === 0 ? (
              <p className="text-muted m-0">❌ No hay acciones registradas todavía.</p>
            ) : (
              <ul className="list-unstyled m-0">
                {historial.map((h) => (
                  <li key={h._id} className="border-bottom pb-2 mb-2">
                    <p className="mb-1">
                      <strong>
                        {h.nombre} {h.apellido}
                      </strong>{' '}
                      {h.accion} ➔ <em>{h.eventoTitulo}</em>
                    </p>
                    <p className="text-muted small mb-0">{h.fecha ? fmt(h.fecha) : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* estilos finos para asegurar encaje pixel-perfect en móviles */}
      <style>{`
        .fc-responsive-wrapper { max-width: 100%; overflow-x: hidden; }
        /* Ajustes de toolbar: que envuelva con gracia en pantallas estrechas */
        .fc .fc-toolbar.fc-header-toolbar { gap: .25rem; flex-wrap: wrap; align-items: center; }
        .fc .fc-toolbar-chunk { display: flex; gap: .25rem; flex-wrap: wrap; }
        .fc .fc-toolbar-title { font-size: 1rem; }
        @media (min-width: 576px) { .fc .fc-toolbar-title { font-size: 1.125rem; } }
        @media (min-width: 768px) { .fc .fc-toolbar-title { font-size: 1.25rem; } }

        /* Botones compactos en móvil sin cambiar la disposición */
        @media (max-width: 575.98px) {
          .fc .fc-button { padding: .32rem .5rem; font-size: .84rem; line-height: 1; }
          .fc .fc-button-group { display: flex; flex-wrap: nowrap; }
          .historial-scroll { max-height: 35vh !important; }
        }

        /* Popups SweetAlert compactos y que no desborden */
        .swal2-popup.swal-compact { width: min(92vw, 480px) !important; padding: 1rem !important; }
        .swal2-popup.swal-compact .swal2-input, .swal2-popup.swal-compact .swal2-textarea { font-size: 0.95rem; }

        /* Evitar scroll horizontal en el calendario */
        .fc .fc-scroller-liquid-absolute, .fc .fc-scroller { overscroll-behavior: contain; }
        .fc { --fc-border-color: rgba(0,0,0,.06); }
        .fc .fc-daygrid-event { border-radius: .375rem; padding: .1rem .25rem; }
      `}</style>
    </div>
  );
};

export default HomeCalendario;
