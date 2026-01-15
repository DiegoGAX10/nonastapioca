// src/utils/helpers.js

// Formatear precio a moneda mexicana
export const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
};

// Obtener icono por categoría
export const getCategoryIcon = (categoryName) => {
    const icons = {
        'Boba': '',
        'Milk Boba': '',
        'Shakes': '',
        'Sodas': '',
        'Snacks': '',
        'Postres': '',
        'Café y Té': ''
    };
    return icons[categoryName] || '';
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

// Extraer categorías únicas de productos - CORREGIDO
export const extractCategories = (productos) => {
    // Usar un objeto para evitar duplicados basado en el nombre de la categoría
    const categoriesMap = {};

    productos.forEach(producto => {
        // Usar el nombre de la categoría como key para evitar duplicados
        const categoryName = producto.categoria;

        if (!categoriesMap[categoryName]) {
            categoriesMap[categoryName] = {
                id: producto.categoria_id || categoryName, // Fallback al nombre si no hay ID
                nombre: categoryName,
                icono: getCategoryIcon(categoryName)
            };
        }
    });

    // Convertir objeto a array y ordenar
    const categories = Object.values(categoriesMap);

    console.log('Categorías extraídas:', categories);

    return categories.sort((a, b) => {
        // Intentar ordenar por ID si existe, sino alfabéticamente
        if (typeof a.id === 'number' && typeof b.id === 'number') {
            return a.id - b.id;
        }
        return a.nombre.localeCompare(b.nombre);
    });
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