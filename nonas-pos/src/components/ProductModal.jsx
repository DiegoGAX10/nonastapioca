// src/components/ProductModal.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';

const ProductModal = ({ visible, producto, extras, onClose }) => {
    const { addToCart } = useCart();
    const [tamano, setTamano] = useState(producto?.tiene_tamanos ? 'chico' : 'unico');
    const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
    const [cantidad, setCantidad] = useState(1);

    const toggleExtra = (extra) => {
        setExtrasSeleccionados(prev => {
            const exists = prev.find(e => e.id === extra.id);
            if (exists) {
                return prev.filter(e => e.id !== extra.id);
            } else {
                return [...prev, extra];
            }
        });
    };

    const handleAddToCart = () => {
        addToCart(producto, tamano, extrasSeleccionados, cantidad);
        setTamano(producto?.tiene_tamanos ? 'chico' : 'unico');
        setExtrasSeleccionados([]);
        setCantidad(1);
        onClose();
    };

    if (!producto) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{producto.nombre}</Text>
                            <Text style={styles.code}>{producto.codigo}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {producto.descripcion && (
                            <Text style={styles.description}>{producto.descripcion}</Text>
                        )}

                        {/* Tamaños */}
                        {producto.tiene_tamanos ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Tamaño:</Text>
                                <View style={styles.sizeButtons}>
                                    <TouchableOpacity
                                        style={[styles.sizeButton, tamano === 'chico' && styles.sizeButtonActive]}
                                        onPress={() => setTamano('chico')}
                                    >
                                        <Text style={[styles.sizeLabel, tamano === 'chico' && styles.sizeLabelActive]}>
                                            Chico
                                        </Text>
                                        <Text style={[styles.sizePrice, tamano === 'chico' && styles.sizePriceActive]}>
                                            {formatCurrency(producto.precio_chico)}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.sizeButton, tamano === 'grande' && styles.sizeButtonActive]}
                                        onPress={() => setTamano('grande')}
                                    >
                                        <Text style={[styles.sizeLabel, tamano === 'grande' && styles.sizeLabelActive]}>
                                            Grande
                                        </Text>
                                        <Text style={[styles.sizePrice, tamano === 'grande' && styles.sizePriceActive]}>
                                            {formatCurrency(producto.precio_grande)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.section}>
                                <View style={styles.singlePrice}>
                                    <Text style={styles.singlePriceLabel}>Precio</Text>
                                    <Text style={styles.singlePriceValue}>
                                        {formatCurrency(producto.precio_unico)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Extras */}
                        {extras && extras.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Extras:</Text>
                                <View style={styles.extrasList}>
                                    {extras.map(extra => (
                                        <TouchableOpacity
                                            key={extra.id}
                                            style={styles.extraItem}
                                            onPress={() => toggleExtra(extra)}
                                        >
                                            <View style={styles.checkbox}>
                                                {extrasSeleccionados.some(e => e.id === extra.id) && (
                                                    <Ionicons name="checkmark" size={16} color="#D4D8C9" />
                                                )}
                                            </View>
                                            <Text style={styles.extraName}>{extra.nombre}</Text>
                                            {extra.precio > 0 && (
                                                <Text style={styles.extraPrice}>+{formatCurrency(extra.precio)}</Text>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Cantidad */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cantidad:</Text>
                            <View style={styles.quantityControl}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => setCantidad(Math.max(1, cantidad - 1))}
                                >
                                    <Ionicons name="remove" size={24} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{cantidad}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => setCantidad(cantidad + 1)}
                                >
                                    <Ionicons name="add" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                        <Text style={styles.addButtonText}>Agregar al Carrito</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    code: {
        fontSize: 14,
        color: '#6b7280',
    },
    content: {
        padding: 20,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    sizeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    sizeButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    sizeButtonActive: {
        borderColor: '#D4D8C9',
        backgroundColor: '#f3e8ff',
    },
    sizeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    sizeLabelActive: {
        color: '#D4D8C9',
    },
    sizePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
    sizePriceActive: {
        color: '#D4D8C9',
    },
    singlePrice: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f3e8ff',
        borderWidth: 2,
        borderColor: '#D4D8C9',
        alignItems: 'center',
    },
    singlePriceLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    singlePriceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
    extrasList: {
        gap: 8,
    },
    extraItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D4D8C9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    extraName: {
        flex: 1,
        fontSize: 14,
        color: '#1f2937',
    },
    extraPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D4D8C9',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    quantityButton: {
        width: 48,
        height: 48,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 28,
        fontWeight: 'bold',
        width: 60,
        textAlign: 'center',
    },
    addButton: {
        margin: 20,
        marginTop: 0,
        backgroundColor: '#D4D8C9',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductModal;