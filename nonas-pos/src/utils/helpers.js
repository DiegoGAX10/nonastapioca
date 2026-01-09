// src/utils/helpers.js

// Formatear precio a moneda mexicana
export const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
};

// Obtener icono por categoría
export const getCategoryIcon = (categoryName) => {
    const icons = {
        'Boba': '🧋',
        'Milk Boba': '🥛',
        'Shakes': '🥤',
        'Sodas': '🫧',
        'Snacks': '🍿',
        'Postres': '🍨'
    };
    return icons[categoryName] || '📦';
};

// Generar UUID simple (para clientes)
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Formatear fecha y hora
export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString('es-MX'),
        time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };
};

// Calcular subtotal de un item del carrito
export const calculateItemSubtotal = (item) => {
    const precioBase = parseFloat(item.precio);
    const precioExtras = item.extras.reduce((sum, extra) => sum + parseFloat(extra.precio), 0);
    return (precioBase + precioExtras) * item.cantidad;
};

// Calcular total del carrito
export const calculateCartTotal = (cartItems) => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
};

// Extraer categorías únicas de productos
export const extractCategories = (productos) => {
    const categoriesMap = new Map();

    productos.forEach(producto => {
        if (!categoriesMap.has(producto.categoria_id)) {
            categoriesMap.set(producto.categoria_id, {
                id: producto.categoria_id,
                nombre: producto.categoria,
                icono: getCategoryIcon(producto.categoria)
            });
        }
    });

    return Array.from(categoriesMap.values()).sort((a, b) => a.id - b.id);
};

// Validar datos de venta
export const validateSaleData = (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
        return { valid: false, error: 'El carrito está vacío' };
    }

    return { valid: true };
};

// Obtener nombre del método de pago
export const getPaymentMethodName = (method) => {
    const names = {
        'efectivo': 'Efectivo',
        'tarjeta': 'Tarjeta',
        'transferencia': 'Transferencia',
        'wallet': 'Wallet Digital'
    };
    return names[method] || method;
};

// Obtener clase CSS por método de pago
export const getPaymentMethodClass = (method) => {
    const classes = {
        'efectivo': 'bg-green-100 text-green-800',
        'tarjeta': 'bg-blue-100 text-blue-800',
        'transferencia': 'bg-purple-100 text-purple-800',
        'wallet': 'bg-pink-100 text-pink-800'
    };
    return classes[method] || 'bg-gray-100 text-gray-800';
};