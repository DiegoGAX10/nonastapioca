# NONAS TAPIOCA - Sistema POS 🧋

Sistema de punto de venta (POS) para NONAS TAPIOCA desarrollado con React Native y Expo.

## 🚀 Stack Tecnológico

- **Frontend**: React Native + Expo
- **Navegación**: React Navigation
- **Estado**: Context API
- **Backend** (próximamente): Node.js + Express
- **Base de Datos** (próximamente): MySQL/PostgreSQL en Aiven
- **QR**: expo-barcode-scanner

## 📱 Características

### ✅ Implementadas
- **Login de cajero** con persistencia de sesión
- **Pantalla POS** con grid de productos
- **Carrito de compras** con gestión de cantidades
- **Escaneo de QR** para identificar clientes
- **Contextos** para autenticación y carrito
- **Componentes reutilizables**: ProductCard, CartItem, TotalBar

### 🔜 Por implementar
- Integración con backend
- Base de datos en Aiven
- Apple Wallet / Google Wallet
- Reportes de ventas
- Gestión de inventario
- Historial de transacciones

## 📂 Estructura del Proyecto

```
nonas-pos/
├── src/
│   ├── screens/
│   │   ├── PosScreen.jsx          # Pantalla principal con productos
│   │   ├── CartScreen.jsx         # Pantalla del carrito
│   │   ├── ScanQrScreen.jsx       # Escáner de QR
│   │   └── LoginScreen.jsx        # Pantalla de login
│   ├── components/
│   │   ├── ProductCard.jsx        # Card de producto
│   │   ├── CartItem.jsx           # Item del carrito
│   │   └── TotalBar.jsx           # Barra con total y botón cobrar
│   ├── services/
│   │   ├── api.js                 # Servicios de API
│   │   └── qr.js                  # Utilidades de QR
│   ├── context/
│   │   ├── CartContext.jsx        # Contexto del carrito
│   │   └── AuthContext.jsx        # Contexto de autenticación
│   └── utils/
│       └── formatMoney.js         # Formato de moneda
└── App.jsx                         # Punto de entrada
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar el proyecto
npm start

# Para iOS
npm run ios

# Para Android
npm run android
```

## 📱 Uso

### Login
- Usuario: cualquier nombre de usuario
- Contraseña: cualquier contraseña
- (Actualmente mock - conectar con backend después)

### POS Screen
1. Tap en un producto para agregarlo al carrito
2. Ver carrito tocando el ícono 🛒
3. Escanear QR del cliente (opcional)
4. Proceder a cobrar

### Cart Screen
- Ajustar cantidades con + y -
- Eliminar productos con ×
- Confirmar venta
- Limpiar carrito

### QR Scanner
- Formato esperado: `NONAS-CLIENTE-{UUID}` o ID del cliente
- Requiere permisos de cámara

## 🔌 Integración con Backend

### Configurar URL del Backend
Editar `src/services/api.js`:
```javascript
const API_URL = 'https://tu-backend-url.com/api';
```

### Endpoints Esperados

#### Productos
```
GET /api/products
Response: [{ id, name, price, image, ... }]
```

#### Ventas
```
POST /api/sales
Body: { items: [...], total: number }
Response: { id, ... }
```

#### Autenticación
```
POST /api/auth/login
Body: { username, password }
Response: { user: {...}, token: "..." }
```

#### Clientes
```
GET /api/clients/:id
Response: { id, name, email, ... }
```

## 🗄️ Base de Datos (Aiven)

### Tablas Necesarias

#### `products`
- id (INT, PK)
- name (VARCHAR)
- price (DECIMAL)
- image_url (VARCHAR)
- active (BOOLEAN)

#### `sales`
- id (INT, PK)
- cashier_id (INT, FK)
- client_id (INT, FK, nullable)
- total (DECIMAL)
- created_at (TIMESTAMP)

#### `sale_items`
- id (INT, PK)
- sale_id (INT, FK)
- product_id (INT, FK)
- quantity (INT)
- price (DECIMAL)

#### `users`
- id (INT, PK)
- username (VARCHAR)
- password_hash (VARCHAR)
- name (VARCHAR)
- role (ENUM: 'cashier', 'admin')

#### `clients`
- id (INT, PK)
- qr_code (VARCHAR, UNIQUE)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)

## 🎨 Personalización

### Colores
Los colores del tema se encuentran en los estilos de cada componente:
- Primary: `#8B4513` (marrón)
- Success: `#28a745` (verde)
- Background: `#f5f5f5` (gris claro)
- White: `#fff`

### Productos Mock
Editar `src/screens/PosScreen.jsx`:
```javascript
const MOCK_PRODUCTS = [
  { id: 1, name: 'Producto', price: 5.00, image: null },
  // ... más productos
];
```

## 🔐 Seguridad

- [ ] Implementar autenticación JWT
- [ ] Encriptar contraseñas con bcrypt
- [ ] Validar datos en backend
- [ ] Usar HTTPS en producción
- [ ] No exponer datos sensibles en QR
- [ ] Implementar rate limiting

## 📝 TODO

- [ ] Conectar con backend real
- [ ] Configurar base de datos en Aiven
- [ ] Implementar autenticación JWT
- [ ] Agregar manejo de errores robusto
- [ ] Implementar offline mode
- [ ] Agregar tests unitarios
- [ ] Optimizar rendimiento
- [ ] Agregar analytics
- [ ] Implementar Apple/Google Wallet

## 📄 Licencia

Privado - NONAS TAPIOCA

## 👥 Autor

Desarrollado para NONAS TAPIOCA
