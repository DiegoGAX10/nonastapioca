// src/context/CartContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { calculateItemSubtotal, calculateCartTotal } from '../utils/helpers';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (producto, tamano, extras, cantidad) => {
        const precio = producto.tiene_tamanos
            ? (tamano === 'chico' ? producto.precio_chico : producto.precio_grande)
            : producto.precio_unico;

        const item = {
            id: Date.now(),
            productoId: producto.id,
            nombre: producto.nombre,
            codigo: producto.codigo,
            tamano,
            precio: parseFloat(precio),
            cantidad,
            extras: extras.map(e => ({
                id: e.id,
                nombre: e.nombre,
                precio: parseFloat(e.precio)
            })),
            precioExtras: extras.reduce((sum, e) => sum + parseFloat(e.precio), 0),
            subtotal: 0
        };

        item.subtotal = calculateItemSubtotal(item);
        setCart([...cart, item]);
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCart(cart.map(item => {
            if (item.id === itemId) {
                const newQuantity = Math.max(1, item.cantidad + delta);
                return {
                    ...item,
                    cantidad: newQuantity,
                    subtotal: calculateItemSubtotal({ ...item, cantidad: newQuantity })
                };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotal = () => {
        return calculateCartTotal(cart);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        itemCount: cart.length
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};