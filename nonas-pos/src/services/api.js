const API_URL = 'https://backend-production-fdd8.up.railway.app/api';

// Helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Productos
export const getProductos = async () => {
  try {
    const response = await fetch(`${API_URL}/productos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
  }
};

export const getProductoById = async (id) => {
  const response = await fetch(`${API_URL}/productos/${id}`);
  return handleResponse(response);
};

export const buscarProductos = async (termino) => {
  const response = await fetch(`${API_URL}/productos/buscar/${termino}`);
  return handleResponse(response);
};

// Extras
export const getExtras = async () => {
  try {
    const response = await fetch(`${API_URL}/productos/extras/todos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al cargar extras:', error);
    throw new Error('No se pudo cargar los extras.');
  }
};

// Ventas
export const crearVenta = async (ventaData) => {
  // Calcular total correcto
  const total = ventaData.items.reduce((sum, item) => {
    const precioItem = parseFloat(item.precio);
    const precioExtras = item.extras.reduce((s, e) => s + parseFloat(e.precio), 0);
    return sum + ((precioItem + precioExtras) * item.cantidad);
  }, 0);

  const payload = {
    items: ventaData.items,
    total: total,
    subtotal: total,
    metodo_pago: ventaData.metodo_pago,
    empleado: ventaData.empleado || 'Cajero',
    notas: ventaData.notas || null,
    cliente_uuid: ventaData.cliente_uuid || null
  };

  console.log(' Enviando venta:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await handleResponse(response);
    console.log(' Venta creada:', data);
    return data;
  } catch (error) {
    console.error(' Error creando venta:', error);
    throw error;
  }
};

export const getVentasHoy = async () => {
  try {
    const response = await fetch(`${API_URL}/ventas/hoy`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await handleResponse(response);

    // El endpoint devuelve { ventas: [], resumen: {} }
    // Retornamos solo el array de ventas
    return data.ventas || [];
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    throw error;
  }
};

export const getVentaByFolio = async (folio) => {
  const response = await fetch(`${API_URL}/ventas/${folio}`);
  return handleResponse(response);
};

// Clientes
export const crearCliente = async (clienteData) => {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clienteData)
  });
  return handleResponse(response);
};

export const getClienteByUUID = async (uuid) => {
  const response = await fetch(`${API_URL}/clientes/qr/${uuid}`);
  return handleResponse(response);
};

export const getClienteByTelefono = async (telefono) => {
  const response = await fetch(`${API_URL}/clientes/telefono/${telefono}`);
  return handleResponse(response);
};

// Canjear puntos del cliente
export const canjearPuntos = async (clienteId, puntosADescontar) => {
  try {
    const response = await fetch(`${API_URL}/clientes/${clienteId}/canjear-puntos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puntos_a_descontar: puntosADescontar
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error al canjear puntos:', error);
    throw error;
  }
};

// Test de conexión
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.error('Error de conexión:', error);
    return false;
  }

};