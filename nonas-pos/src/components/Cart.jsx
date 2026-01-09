// src/components/Cart.jsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';

const Cart = ({ onCheckout }) => {
    const { cart, removeFromCart, updateQuantity, getTotal, itemCount } = useCart();

    const getTamanoLabel = (tamano) => {
        const labels = { 'chico': 'Chico', 'grande': 'Grande', 'unico': 'Único' };
        return labels[tamano] || tamano;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="cart" size={24} color="#D4D8C9" />
                <Text style={styles.title}>Carrito ({itemCount})</Text>
            </View>

            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {cart.map(item => (
                    <View key={item.id} style={styles.item}>
                        <View style={styles.itemHeader}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.nombre}</Text>
                                <Text style={styles.itemSize}>{getTamanoLabel(item.tamano)}</Text>
                                {item.extras.length > 0 && (
                                    <View style={styles.extras}>
                                        {item.extras.map((extra, idx) => (
                                            <Text key={idx} style={styles.extraText}>
                                                + {extra.nombre} {extra.precio > 0 && `(${formatCurrency(extra.precio)})`}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                <Ionicons name="trash" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.itemFooter}>
                            <View style={styles.quantity}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, -1)}
                                >
                                    <Ionicons name="remove" size={16} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{item.cantidad}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, 1)}
                                >
                                    <Ionicons name="add" size={16} color="#000" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {itemCount === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="cart-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyText}>Carrito vacío</Text>
                </View>
            ) : (
                <>
                    <View style={styles.total}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalAmount}>{formatCurrency(getTotal())}</Text>
                    </View>

                    <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
                        <Ionicons name="card" size={20} color="#fff" />
                        <Text style={styles.checkoutText}>Procesar Pago</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    itemsList: {
        flex: 1,
        marginBottom: 20,
    },
    item: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
        gap: 4,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    itemSize: {
        fontSize: 12,
        color: '#6b7280',
    },
    extras: {
        marginTop: 4,
    },
    extraText: {
        fontSize: 11,
        color: '#D4D8C9',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantity: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityButton: {
        width: 28,
        height: 28,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        width: 32,
        textAlign: 'center',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    total: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
    checkoutButton: {
        backgroundColor: '#D4D8C9',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Cart;