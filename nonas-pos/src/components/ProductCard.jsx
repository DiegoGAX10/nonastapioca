// src/components/ProductCard.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/helpers';

const ProductCard = ({ producto, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(producto)}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{producto.nombre}</Text>
                    <Text style={styles.code}>{producto.codigo}</Text>
                </View>

                <View style={styles.footer}>
                    {producto.tiene_tamanos ? (
                        <View style={styles.prices}>
                            <Text style={styles.priceSmall}>Ch: {formatCurrency(producto.precio_chico)}</Text>
                            <Text style={styles.priceSmall}>Gr: {formatCurrency(producto.precio_grande)}</Text>
                        </View>
                    ) : (
                        <Text style={styles.priceMain}>{formatCurrency(producto.precio_unico)}</Text>
                    )}
                    <Ionicons name="add-circle" size={24} color="#D4D8C9" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    content: {
        gap: 12,
    },
    info: {
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    code: {
        fontSize: 12,
        color: '#6b7280',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    prices: {
        gap: 4,
    },
    priceSmall: {
        fontSize: 14,
        color: '#4b5563',
    },
    priceMain: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
});

export default ProductCard;