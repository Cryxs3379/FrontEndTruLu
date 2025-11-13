import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EditarClienteGarajeModal = ({ open, onClose, cliente, onGuardar }) => {
  const [form, setForm] = useState({ ...cliente });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = () => {
    onGuardar(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', bgcolor: 'background.paper',
        boxShadow: 24, p: 4, borderRadius: 2, width: 500
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Editar Cliente (Garaje)</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <TextField
          fullWidth
          label="Trabajador asignado"
          name="trabajadorasignado"
          value={form.trabajadorasignado || ''}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Notas del trabajador"
          name="notastrabajador"
          value={form.notastrabajador || ''}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleGuardar}
          sx={{ mt: 3 }}
        >
          Guardar Cambios
        </Button>
      </Box>
    </Modal>
  );
};

export default EditarClienteGarajeModal;
