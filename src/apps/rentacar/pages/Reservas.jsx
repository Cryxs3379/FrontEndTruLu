import React, { useState } from 'react';
import { crearReserva } from '../api/apiRentacar';

const Reservas = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    dni: '',
    telefono: '',
    categoriacoche: '',
    fecharecogercoche: '',
    horarecogercoche: '',
    fechadevolvercoche: '',
    horadevolvercoche: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearReserva(form);
      alert('✅ Reserva creada correctamente');
      setForm({
        nombre: '',
        apellidos: '',
        email: '',
        dni: '',
        telefono: '',
        categoriacoche: '',
        fecharecogercoche: '',
        horarecogercoche: '',
        fechadevolvercoche: '',
        horadevolvercoche: '',
      });
    } catch (err) {
      console.error('❌ Error al crear la reserva', err);
      alert('❌ Error al crear la reserva');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">📅 Crear Reserva</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <input type="text" className="form-control" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input type="text" className="form-control" name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input type="email" className="form-control" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input type="text" className="form-control" name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input type="number" className="form-control" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <input type="text" className="form-control" name="categoriacoche" placeholder="Categoría del coche" value={form.categoriacoche} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">📅 Fecha recogida</label>
          <input type="date" className="form-control" name="fecharecogercoche" value={form.fecharecogercoche} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">⏰ Hora recogida</label>
          <input type="time" className="form-control" name="horarecogercoche" value={form.horarecogercoche} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">📅 Fecha devolución</label>
          <input type="date" className="form-control" name="fechadevolvercoche" value={form.fechadevolvercoche} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">⏰ Hora devolución</label>
          <input type="time" className="form-control" name="horadevolvercoche" value={form.horadevolvercoche} onChange={handleChange} required />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-success w-100 fw-bold">
            Reservar 🚗
          </button>
        </div>
      </form>
    </div>
  );
};

export default Reservas;
