// src/components/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';

const ProductModal = ({ visible, producto, extras, onClose }) => {
    const { addToCart } = useCart();
    const [tamano, setTamano] = useState(producto?.tiene_tamanos ? 'chico' : 'unico');
    const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
    const [cantidad, setCantidad] = useState(1);
    const [extrasAgrupados, setExtrasAgrupados] = useState({});

    useEffect(() => {
        if (producto && extras) {
            const filtrados = filtrarExtrasPorProducto(producto, extras);
            setExtrasAgrupados(filtrados);
            setExtrasSeleccionados([]);
        }
    }, [producto, extras]);

    const filtrarExtrasPorProducto = (producto, todosLosExtras) => {
        if (!producto) return {};

        const categoria = producto.categoria;
        const codigo = producto.codigo;

        // Filtrar extras según categoría
        const extrasAplicables = todosLosExtras.filter(extra => {
            if (!extra.categoria_aplicable) return false;
            return extra.categoria_aplicable.split(',').some(cat => cat.trim() === categoria);
        });

        // Agrupar extras según el producto
        const grupos = {};

        // Reglas específicas por categoría
        if (categoria === 'Boba' || categoria === 'Milk Boba' || categoria === 'Shakes') {
            // Bebidas: Leche, Tapioca, Jelly
            grupos['Tipo de Leche'] = extrasAplicables.filter(e => e.nombre === 'Leche Deslactosada');
            grupos['Adicionales'] = extrasAplicables.filter(e =>
                e.nombre === 'Tapioca Extra' || e.nombre === 'Jelly de Café Extra'
            );
        }
        else if (categoria === 'Sodas') {
            // Sodas: Sin extras
            return {};
        }
        else if (categoria === 'Snacks') {
            // Snacks: Solo papas para Tosti y Dori
            if (codigo === 'SN001' || codigo === 'SN002') {
                grupos['Elige tus papas'] = extrasAplicables.filter(e => e.subcategoria === 'papas');
            }
            // Maruchan: papas
            if (codigo === 'SN003') {
                grupos['Elige tus papas'] = extrasAplicables.filter(e => e.subcategoria === 'papas');
            }
        }
        else if (categoria === 'Postres') {
            if (codigo === 'P001') {
                // Fresas con Crema: todos los toppings
                grupos['Toppings'] = extrasAplicables.filter(e => e.subcategoria === 'fresas');
            }
            else if (codigo === 'P002') {
                // Bubble Waffle completo
                grupos['Bola de Nieve'] = extrasAplicables.filter(e => e.subcategoria === 'waffle_nieve');
                grupos['Toppings (Max 2)'] = extrasAplicables.filter(e => e.subcategoria === 'waffle_topping');
                grupos['Base'] = extrasAplicables.filter(e => e.subcategoria === 'waffle_base');
            }
            else if (codigo === 'P003') {
                // Bubble Waffle Sencillo: solo base
                grupos['Base'] = extrasAplicables.filter(e =>
                    e.subcategoria === 'waffle_base' ||
                    (e.subcategoria === 'fresas' && (e.nombre === 'Nutella' || e.nombre === 'Cajeta'))
                );
            }
        }

        return grupos;
    };

    const toggleExtra = (extra, grupo) => {
        setExtrasSeleccionados(prev => {
            const exists = prev.find(e => e.id === extra.id);

            // Validaciones especiales
            if (!exists) {
                // Waffle: Max 2 toppings
                if (grupo === 'Toppings (Max 2)') {
                    const toppingActuales = prev.filter(e =>
                        extrasAgrupados['Toppings (Max 2)']?.some(t => t.id === e.id)
                    );
                    if (toppingActuales.length >= 2) {
                        alert('Máximo 2 toppings permitidos');
                        return prev;
                    }
                }

                // Papas: Solo una opción
                if (grupo === 'Elige tus papas') {
                    const nuevos = prev.filter(e =>
                        !extrasAgrupados['Elige tus papas']?.some(p => p.id === e.id)
                    );
                    return [...nuevos, extra];
                }

                // Bola de nieve: Solo una
                if (grupo === 'Bola de Nieve') {
                    const nuevos = prev.filter(e =>
                        !extrasAgrupados['Bola de Nieve']?.some(b => b.id === e.id)
                    );
                    return [...nuevos, extra];
                }

                // Base: Solo una
                if (grupo === 'Base') {
                    const nuevos = prev.filter(e =>
                        !extrasAgrupados['Base']?.some(b => b.id === e.id)
                    );
                    return [...nuevos, extra];
                }

                return [...prev, extra];
            } else {
                return prev.filter(e => e.id !== extra.id);
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

    const tieneExtras = Object.keys(extrasAgrupados).length > 0;

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

                        {/* Extras Agrupados */}
                        {tieneExtras && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Personaliza tu orden:</Text>
                                {Object.entries(extrasAgrupados).map(([grupo, extrasGrupo]) => (
                                    extrasGrupo.length > 0 && (
                                        <View key={grupo} style={styles.extraGroup}>
                                            <Text style={styles.groupTitle}>{grupo}</Text>
                                            <View style={styles.extrasList}>
                                                {extrasGrupo.map(extra => (
                                                    <TouchableOpacity
                                                        key={extra.id}
                                                        style={styles.extraItem}
                                                        onPress={() => toggleExtra(extra, grupo)}
                                                    >
                                                        <View style={styles.checkbox}>
                                                            {extrasSeleccionados.some(e => e.id === extra.id) && (
                                                                <Ionicons name="checkmark" size={16} color="#10b981" />
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
                                    )
                                ))}
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
        borderColor: '#10b981',
        backgroundColor: '#d1fae5',
    },
    sizeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    sizeLabelActive: {
        color: '#10b981',
    },
    sizePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    sizePriceActive: {
        color: '#10b981',
    },
    singlePrice: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#d1fae5',
        borderWidth: 2,
        borderColor: '#10b981',
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
        color: '#10b981',
    },
    extraGroup: {
        marginBottom: 16,
    },
    groupTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#10b981',
        marginBottom: 8,
        textTransform: 'uppercase',
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
        borderColor: '#10b981',
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
        color: '#10b981',
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
        backgroundColor: '#10b981',
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