// src/screens/POSScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import ProductModal from '../components/ProductModal';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';
import { useCart } from '../context/CartContext';
import { crearVenta } from '../services/api';

const POSScreen = ({ productos, categorias, extras }) => {
    const { cart, clearCart } = useCart();
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [saleSuccess, setSaleSuccess] = useState(null);

    const productosFiltrados = productos.filter(p => {
        const matchSearch = busqueda === '' ||
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.codigo.toLowerCase().includes(busqueda.toLowerCase());

        const matchCategory = !categoriaSeleccionada || p.categoria_id === categoriaSeleccionada;

        return matchSearch && matchCategory && p.activo;
    });

    const handleProcessPayment = async (metodoPago) => {
        try {
            const ventaData = {
                items: cart.map(item => ({
                    producto_id: item.productoId,
                    producto_nombre: item.nombre,
                    tamano: item.tamano,
                    precio_unitario: item.precio,
                    cantidad: item.cantidad,
                    extras: item.extras
                })),
                metodo_pago: metodoPago,
                empleado: 'Cajero iPad'
            };

            const resultado = await crearVenta(ventaData);

            setSaleSuccess({
                folio: resultado.folio,
                total: resultado.total,
                metodoPago
            });

            clearCart();
            setShowPaymentModal(false);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Panel Izquierdo - Productos */}
                <View style={styles.leftPanel}>
                    {/* Búsqueda */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChangeText={setBusqueda}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Categorías */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categories}
                        contentContainerStyle={styles.categoriesContent}
                    >
                        <TouchableOpacity
                            style={[styles.categoryButton, !categoriaSeleccionada && styles.categoryButtonActive]}
                            onPress={() => setCategoriaSeleccionada(null)}
                        >
                            <Text style={[styles.categoryText, !categoriaSeleccionada && styles.categoryTextActive]}>
                                Todos
                            </Text>
                        </TouchableOpacity>
                        {categorias.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryButton,
                                    categoriaSeleccionada === cat.id && styles.categoryButtonActive
                                ]}
                                onPress={() => setCategoriaSeleccionada(cat.id)}
                            >
                                <Text style={styles.categoryEmoji}>{cat.icono}</Text>
                                <Text style={[
                                    styles.categoryText,
                                    categoriaSeleccionada === cat.id && styles.categoryTextActive
                                ]}>
                                    {cat.nombre}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Lista de Productos */}
                    <FlatList
                        data={productosFiltrados}
                        renderItem={({ item }) => (
                            <ProductCard producto={item} onPress={setProductoSeleccionado} />
                        )}
                        keyExtractor={item => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.productRow}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.productList}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyList}>
                                <Ionicons name="cube-outline" size={64} color="#d1d5db" />
                                <Text style={styles.emptyText}>No se encontraron productos</Text>
                            </View>
                        )}
                    />
                </View>

                {/* Panel Derecho - Carrito */}
                <View style={styles.rightPanel}>
                    <Cart onCheckout={() => setShowPaymentModal(true)} />
                </View>
            </View>

            {/* Modales */}
            <ProductModal
                visible={!!productoSeleccionado}
                producto={productoSeleccionado}
                extras={extras}
                onClose={() => setProductoSeleccionado(null)}
            />

            <PaymentModal
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onProcessPayment={handleProcessPayment}
            />

            <SuccessModal
                visible={!!saleSuccess}
                saleData={saleSuccess}
                onClose={() => setSaleSuccess(null)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        gap: 16,
    },
    leftPanel: {
        flex: 2,
        gap: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    categories: {
        maxHeight: 60,
    },
    categoriesContent: {
        gap: 8,
        paddingHorizontal: 4,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    categoryButtonActive: {
        backgroundColor: '#D4D8C9',
    },
    categoryEmoji: {
        fontSize: 16,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        whiteSpace: 'nowrap',
    },
    categoryTextActive: {
        color: '#fff',
    },
    productList: {
        paddingBottom: 20,
    },
    productRow: {
        gap: 12,
        marginBottom: 12,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    rightPanel: {
        flex: 1,
        minWidth: 350,
    },
});

export default POSScreen;