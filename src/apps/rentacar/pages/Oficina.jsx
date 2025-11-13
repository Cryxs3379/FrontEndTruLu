import React, { useEffect, useState } from 'react';
import { getReservas, getClientes, confirmarCliente } from '../api/apiRentacar';
import EditarReservaModal from '../components/EditarReservaModal';
import { eliminarCliente } from '../api/apiRentacar';

const Oficina = () => {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const dataReservas = await getReservas();
      const dataClientes = await getClientes();
      setReservas(dataReservas);
      setClientes(dataClientes);
    };
    fetchData();
  }, []);

  const handleEditar = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalAbierto(true);
  };
  
  const handleEliminarCliente = async (cliente) => {
  const confirmado = window.confirm(`¿Seguro que deseas eliminar al cliente ${cliente.nombre} ${cliente.apellidos}?`);
  if (!confirmado) return;

  try {
    await eliminarCliente(cliente.id, cliente.idcoche);
    const dataClientes = await getClientes();
    const dataReservas = await getReservas();
    setClientes(dataClientes);
    setReservas(dataReservas);
  } catch (error) {
    console.error('❌ Error al eliminar cliente:', error);
  }
};

  const handleConfirmarCliente = async (reservaActualizada) => {
    try {
      await confirmarCliente(reservaActualizada);
      setModalAbierto(false);
      const dataReservas = await getReservas();
      const dataClientes = await getClientes();
      setReservas(dataReservas);
      setClientes(dataClientes);
    } catch (error) {
      console.error('Error al confirmar cliente:', error);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">📋 Reservas</h2>
      <div className="table-responsive mb-5">
        <table className="table table-bordered table-hover">
          <thead className="table-dark text-center">
            <tr>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Categoría Coche</th>
              <th>Fecha Recogida</th>
              <th>Hora Recogida</th>
              <th>Fecha Devolución</th>
              <th>Hora Devolución</th>
              <th>Acciones</th>
              
            </tr>
          </thead>
          <tbody>
            {reservas.map(reserva => (
              <tr key={reserva.id}>
                <td>{reserva.nombre}</td>
                <td>{reserva.apellidos}</td>
                <td>{reserva.email}</td>
                <td>{reserva.dni}</td>
                <td>{reserva.telefono}</td>
                <td>{reserva.categoriacoche}</td>
                <td>{reserva.fecharecogercoche}</td>
                <td>{reserva.horarecogercoche}</td>
                <td>{reserva.fechadevolvercoche}</td>
                <td>{reserva.horadevolvercoche}</td>
                
                <td className="text-center">
                  <button className="btn btn-sm btn-primary" onClick={() => handleEditar(reserva)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3">👥 Clientes</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-light text-center">
            <tr>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Fecha Recogida</th>
              <th>Hora Recogida</th>
              <th>Fecha Devolución</th>
              <th>Hora Devolución</th>
              <th>ID Coche</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Categoría</th>
              <th>Precio/Día</th>
              <th>Trabajador asignado</th>
              <th>Notas trabajador </th>
              <th>Acciones</th>
              
            </tr>
          </thead>
   <tbody>
  {clientes.map(cliente => (
    <tr key={cliente.id}>
      <td>{cliente.nombre}</td>
      <td>{cliente.apellidos}</td>
      <td>{cliente.email}</td>
      <td>{cliente.dni}</td>
      <td>{cliente.telefono}</td>
      <td>{cliente.fecharecogercoche}</td>
      <td>{cliente.horarecogercoche}</td>
      <td>{cliente.fechadevolvercoche}</td>
      <td>{cliente.horadevolvercoche}</td>
      <td>{cliente.idcoche}</td>
      <td>{cliente.marcacoche}</td>
      <td>{cliente.modelocoche}</td>
      <td>{cliente.categoriacoche}</td>
      <td>{cliente.precio} €</td>
      <td>{cliente.trabajadorasignado}</td>
      <td>{cliente.notastrabajador}</td>
      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleEliminarCliente(cliente)}
        >
          Eliminar
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {modalAbierto && (
        <EditarReservaModal
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          reserva={reservaSeleccionada}
          onConfirmar={handleConfirmarCliente}
        />
      )}
    </div>
  );
};

export default Oficina;
