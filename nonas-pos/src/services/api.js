// src/services/api.js
// Importante: usa la IP de tu máquina accesible desde el dispositivo (no "localhost").
// Ejemplo: si Metro está en exp://192.168.1.74:8081, probablemente tu backend esté en http://192.168.1.74:3000
const API_URL = 'http://192.168.1.74:3000/api';

// Productos
export const getProductos = async () => {
  const response = await fetch(`${API_URL}/productos`);
  if (!response.ok) throw new Error('Error al cargar productos');
  return response.json();
};

export const getProductoById = async (id) => {
  const response = await fetch(`${API_URL}/productos/${id}`);
  if (!response.ok) throw new Error('Error al cargar producto');
  return response.json();
};

export const buscarProductos = async (termino) => {
  const response = await fetch(`${API_URL}/productos/buscar/${termino}`);
  if (!response.ok) throw new Error('Error al buscar productos');
  return response.json();
};

// Extras
export const getExtras = async () => {
  const response = await fetch(`${API_URL}/productos/extras/todos`);
  if (!response.ok) throw new Error('Error al cargar extras');
  return response.json();
};

// Ventas
export const crearVenta = async (ventaData) => {
  const response = await fetch(`${API_URL}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ventaData)
  });
  if (!response.ok) throw new Error('Error al crear venta');
  return response.json();
};

export const getVentasHoy = async () => {
  const response = await fetch(`${API_URL}/ventas/hoy`);
  if (!response.ok) throw new Error('Error al cargar ventas');
  return response.json();
};

export const getVentaByFolio = async (folio) => {
  const response = await fetch(`${API_URL}/ventas/${folio}`);
  if (!response.ok) throw new Error('Error al cargar venta');
  return response.json();
};

// Clientes
export const crearCliente = async (clienteData) => {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clienteData)
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return response.json();
};

export const getClienteByUUID = async (uuid) => {
  const response = await fetch(`${API_URL}/clientes/qr/${uuid}`);
  if (!response.ok) throw new Error('Error al buscar cliente');
  return response.json();
};

export const getClienteByTelefono = async (telefono) => {
  const response = await fetch(`${API_URL}/clientes/telefono/${telefono}`);
  if (!response.ok) throw new Error('Error al buscar cliente');
  return response.json();
};