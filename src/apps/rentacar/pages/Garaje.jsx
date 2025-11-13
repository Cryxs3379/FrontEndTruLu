import React, { useEffect, useState } from 'react';
import { getClientes, actualizarCliente } from '../api/apiRentacar';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Garaje = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ trabajadorasignado: '', notastrabajador: '' });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientes();
        const ordenados = [...data].sort((a, b) => {
          const dateTimeA = new Date(`${a.fecharecogercoche}T${a.horarecogercoche}`);
          const dateTimeB = new Date(`${b.fecharecogercoche}T${b.horarecogercoche}`);
          return dateTimeA - dateTimeB;
        });
        setClientes(ordenados);
      } catch (error) {
        console.error('❌ Error al cargar clientes:', error);
      }
    };
    fetchClientes();
  }, []);

  const handleAbrirModal = (cliente) => {
    setClienteSeleccionado(cliente);
    setForm({
      trabajadorasignado: cliente.trabajadorasignado || '',
      notastrabajador: cliente.notastrabajador || ''
    });
    setModalAbierto(true);
  };

  const handleGuardar = async () => {
    try {
      await actualizarCliente(clienteSeleccionado.id, form);
      const data = await getClientes();
      const ordenados = [...data].sort((a, b) => {
        const dateTimeA = new Date(`${a.fecharecogercoche}T${a.horarecogercoche}`);
        const dateTimeB = new Date(`${b.fecharecogercoche}T${b.horarecogercoche}`);
        return dateTimeA - dateTimeB;
      });
      setClientes(ordenados);
      setModalAbierto(false);
    } catch (error) {
      console.error('❌ Error al actualizar cliente:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">🚗 Garaje app trabajadores (Coches que salen del)</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-light text-center">
            <tr>
              <th>Teléfono</th>
              <th>Fecha Recogida</th>
              <th>Hora Recogida</th>
              <th>Fecha Devolución</th>
              <th>Hora Devolución</th>
              <th>ID Coche</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Categoría</th>
              <th>Trabajador asignado</th>
              <th>Notas trabajador</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.telefono}</td>
                <td>{cliente.fecharecogercoche}</td>
                <td>{cliente.horarecogercoche}</td>
                <td>{cliente.fechadevolvercoche}</td>
                <td>{cliente.horadevolvercoche}</td>
                <td>{cliente.idcoche}</td>
                <td>{cliente.marcacoche}</td>
                <td>{cliente.modelocoche}</td>
                <td>{cliente.categoriacoche}</td>
                <td>{cliente.trabajadorasignado}</td>
                <td>{cliente.notastrabajador}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => handleAbrirModal(cliente)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          width: '90%',
          maxWidth: 500
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Editar Cliente</Typography>
            <IconButton onClick={() => setModalAbierto(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            margin="normal"
            label="Trabajador asignado"
            name="trabajadorasignado"
            value={form.trabajadorasignado}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Notas del trabajador"
            name="notastrabajador"
            value={form.notastrabajador}
            onChange={handleChange}
            multiline
            rows={4}
          />

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleGuardar}>
            Guardar cambios
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Garaje;
