import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './db.js';

// Importar rutas
import productosRoutes from './routes/productos.js';
import ventasRoutes from './routes/ventas.js';
import clientesRoutes from './routes/clientes.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS más permisivo para desarrollo
app.use(cors({
  origin: '*', // Permite todos los orígenes en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/clientes', clientesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'NONAS TAPIOCA API',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      ventas: '/api/ventas',
      clientes: '/api/clientes'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    const connected = await testConnection();

    if (!connected) {
      console.error(' No se pudo conectar a la base de datos. Verifica tu configuración en DATOSB.js');
      process.exit(1);
    }

    // Iniciar servidor en todas las interfaces (0.0.0.0)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n Servidor corriendo en puerto ${PORT}`);
      console.log(` API disponible en: http://localhost:${PORT}`);
      console.log(` Desde tu red: http://TU_IP:${PORT}`);
      console.log(` Documentación: http://localhost:${PORT}/\n`);
    });
  } catch (error) {
    console.error(' Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar
startServer();