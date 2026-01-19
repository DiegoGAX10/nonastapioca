// src/screens/POSScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductModal from '../components/ProductModal';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';
import CustomerIdentificationModal from "../components/CustomerIdentificationModal";
import { useCart } from '../context/CartContext';
import { crearVenta } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import PointsRedemptionModal from '../components/PointsRedemptionModal';
import { canjearPuntos } from '../services/api';

const POSScreen = ({ productos, categorias, extras }) => {
    const { cart, removeFromCart, updateQuantity, getTotal, clearCart, addToCart } = useCart();
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [saleSuccess, setSaleSuccess] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [clienteActual, setClienteActual] = useState(null);
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [showNoPointsModal, setShowNoPointsModal] = useState(false);
    const [noPointsInfo, setNoPointsInfo] = useState(null);
    const [pagoDesdeCanje, setPagoDesdeCanje] = useState(false);
    const [modoCanje, setModoCanje] = useState(false);





    const productosFiltrados = productos.filter(p => {
        const matchSearch = busqueda === '' ||
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.codigo.toLowerCase().includes(busqueda.toLowerCase());

        const matchCategory = !categoriaSeleccionada || p.categoria === categoriaSeleccionada;

        return matchSearch && matchCategory;
    });

    // Debug: ver qué productos y categorías tenemos
    console.log('Total productos:', productos.length);
    console.log('Categorias extraídas:', categorias);
    console.log('Productos filtrados:', productosFiltrados.length);

    const handleProcessPayment = async (metodoPago) => {
        try {
            console.log('🛒 Carrito actual:', cart);

            const ventaData = {
                items: cart.map(item => ({
                    producto_id: item.productoId,
                    nombre: item.nombre,
                    tamano: item.tamano,
                    precio: parseFloat(item.precio),
                    cantidad: parseInt(item.cantidad),
                    extras: item.extras.map(e => ({
                        id: e.id,
                        nombre: e.nombre,
                        precio: parseFloat(e.precio)
                    }))
                })),
                metodo_pago: metodoPago,
                empleado: 'Cajero iPad',
                cliente_uuid: clienteActual?.uuid || null
            };

            console.log(' Datos de venta preparados:', ventaData);
            console.log(' Cliente actual:', clienteActual);
            console.log(' Datos de venta preparados:', ventaData);

            const resultado = await crearVenta(ventaData);

            console.log(' Venta exitosa:', resultado);

            setSaleSuccess({
                folio: resultado.folio,
                total: resultado.total,
                metodoPago
            });

            setClienteActual(null);

            clearCart();
            setShowPaymentModal(false);
        } catch (error) {
            console.error(' Error completo:', error);
            alert('Error al procesar venta: ' + error.message);
        }
    };

    const getTamanoLabel = (tamano) => {
        const labels = { 'chico': 'Ch', 'grande': 'Gr', 'unico': '' };
        return labels[tamano] || tamano;
    };

    const handleRedeemPoints = async (recompensa, cliente) => {
        try {


            console.log(' Canjeando recompensa:', recompensa);

            // Mostrar selector de producto
            // Por ahora, tomamos el primer producto disponible
            const productoSeleccionado = recompensa.productos[0];

            if (!productoSeleccionado) {
                alert('No hay productos disponibles para esta recompensa');
                return;
            }

            // Descontar puntos del cliente
            const resultado = await canjearPuntos(cliente.id, recompensa.puntosNecesarios);

            console.log(' Puntos canjeados:', resultado);

            // Agregar producto al carrito con precio $0
            const productoGratis = {
                ...productoSeleccionado,
                precio_unico: 0,
                precio_chico: 0,
                precio_grande: 0,
                es_canje: true // Marcar como canje
            };

            // Determinar tamaño según el precio de la recompensa
            let tamanoSeleccionado = 'unico';
            if (productoSeleccionado.tiene_tamanos) {
                if (productoSeleccionado.precio_chico == recompensa.valor) {
                    tamanoSeleccionado = 'chico';
                } else if (productoSeleccionado.precio_grande == recompensa.valor) {
                    tamanoSeleccionado = 'grande';
                }
            }

            // Agregar al carrito
            addToCart(productoGratis, tamanoSeleccionado, [], 1);

            // Actualizar puntos del cliente
            const clienteActualizado = {
                ...cliente,
                puntos: resultado.puntos_restantes
            };
            setClienteActual(clienteActualizado);

            alert(`¡${recompensa.puntosNecesarios} puntos canjeados! ${productoSeleccionado.nombre} agregado gratis al carrito`);

            setShowPointsModal(false);
            setShowPaymentModal(true);

        } catch (error) {
            console.error(' Error al canjear puntos:', error);
            alert('Error al canjear puntos: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Panel Izquierdo - TICKET */}
            <View style={styles.ticketPanel}>
                <View style={styles.ticketHeader}>
                    <Text style={styles.ticketTitle}>Ticket</Text>
                    <View style={styles.ticketInfo}>
                        <Text style={styles.mesaText}></Text>
                    </View>
                </View>

                {/* Lista de items en el ticket */}
                <ScrollView style={styles.ticketItems} showsVerticalScrollIndicator={false}>
                    {cart.length === 0 ? (
                        <View style={styles.emptyTicket}>
                            <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Sin productos</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.ticketTableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 2.5 }]}>NOMBRE</Text>
                                <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>CANT</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>PRECIO</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>TOTAL</Text>
                            </View>

                            {cart.map(item => (
                                <View key={item.id} style={styles.ticketItem}>
                                    <View style={styles.ticketItemRow}>
                                        <View style={{ flex: 2.5 }}>
                                            <Text style={styles.ticketItemName}>{item.nombre}</Text>
                                            <Text style={styles.ticketItemSize}>{getTamanoLabel(item.tamano)}</Text>
                                            {item.extras.length > 0 && (
                                                <View style={styles.ticketExtras}>
                                                    {item.extras.map((extra, idx) => (
                                                        <Text key={idx} style={styles.ticketExtraText}>
                                                            {extra.nombre}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </View>

                                        <View style={[styles.ticketItemQuantity, { flex: 0.8 }]}>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.id, -1)}
                                            >
                                                <Ionicons name="remove" size={14} color="#6b7280" />
                                            </TouchableOpacity>
                                            <Text style={styles.qtyText}>{item.cantidad}</Text>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.id, 1)}
                                            >
                                                <Ionicons name="add" size={14} color="#6b7280" />
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={[styles.ticketItemPrice, { flex: 1 }]}>
                                            {formatCurrency(item.precio)}
                                        </Text>
                                        <Text style={[styles.ticketItemTotal, { flex: 1 }]}>
                                            {formatCurrency(item.subtotal)}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => removeFromCart(item.id)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>

                {/* Footer del ticket */}
                <View style={styles.ticketFooter}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Precio total</Text>
                        <Text style={styles.totalAmount}>{formatCurrency(getTotal())}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.payButton, cart.length === 0 && styles.payButtonDisabled]}
                        onPress={() => {
                            setModoCanje(false);          // ⛔ NO canje
                            setShowCustomerModal(true);   // solo identificar cliente
                        }}
                        disabled={cart.length === 0}
                    >
                        <Text style={styles.payButtonText}>Pagar</Text>
                    </TouchableOpacity>



                    <TouchableOpacity
                        style={[styles.pointsButton, cart.length === 0]}
                        onPress={() => {
                            setModoCanje(true);
                            setShowCustomerModal(true);
                        }}
                    >
                        <Text style={styles.payButtonText}>Canjear Puntos</Text>
                    </TouchableOpacity>


                </View>
            </View>

            {/* Panel Derecho - PRODUCTOS */}
            <View style={styles.productsPanel}>
                {/* Búsqueda y Filtros */}
                <View style={styles.topBar}>
                    {/*  <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChangeText={setBusqueda}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>*/}
                </View>

                {/* Categorías */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categorias.map(cat => (
                        <TouchableOpacity
                            key={`categoria-${cat.id}`}
                            style={[
                                styles.categoryChip,
                                categoriaSeleccionada === cat.nombre && styles.categoryChipActive
                            ]}
                            onPress={() => setCategoriaSeleccionada(cat.nombre)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                categoriaSeleccionada === cat.nombre && styles.categoryChipTextActive
                            ]}>
                                {cat.nombre}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Grid de Productos */}
                <ScrollView
                    style={styles.productsScroll}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.productsGrid}>
                        {productosFiltrados.map(producto => (
                            <TouchableOpacity
                                key={`producto-${producto.id}`}
                                style={styles.productCard}
                                onPress={() => setProductoSeleccionado(producto)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.productImageContainer}>
                                    {producto.imagen_url ? (
                                        <Image
                                            source={{ uri: producto.imagen_url }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[styles.productImage, styles.productImagePlaceholder]}>
                                            <Text style={styles.productEmoji}></Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {producto.nombre}
                                    </Text>
                                    {producto.tiene_tamanos ? (
                                        <Text style={styles.productPrice}>
                                            {formatCurrency(producto.precio_chico)}
                                        </Text>
                                    ) : (
                                        <Text style={styles.productPrice}>
                                            {formatCurrency(producto.precio_unico)}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

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

            <CustomerIdentificationModal
                visible={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                onCustomerIdentified={(cliente) => {
                    setClienteActual(cliente);
                    setShowCustomerModal(false);

                    const puntos = cliente.puntos || 0;
                    const MIN_PUNTOS = 45;

                    // 🔵 SI VIENE DE CANJEAR → FORZAR CANJE
                    if (modoCanje) {
                        if (puntos >= MIN_PUNTOS) {
                            setShowPointsModal(true);
                        } else {
                            setNoPointsInfo({
                                nombre: cliente.nombre,
                                puntos,
                                faltan: MIN_PUNTOS - puntos,
                                min: MIN_PUNTOS
                            });
                            setShowNoPointsModal(true);
                        }
                        return;
                    }

                    // 🟢 SI VIENE DE PAGAR
                    if (puntos >= MIN_PUNTOS) {
                        // 👉 mostrar canje OPCIONAL
                        setShowPointsModal(true);
                    } else {
                        // 👉 ir directo a pagar
                        setShowPaymentModal(true);
                    }
                }}




                onSkip={() => {
                    console.log('Cliente saltó el registro');
                    setClienteActual(null);
                    setShowCustomerModal(false);
                    setShowPaymentModal(true);
                }}
            />

            {modoCanje && (
                <PointsRedemptionModal
                    visible={showPointsModal}
                    cliente={clienteActual}
                    productos={productos}
                    onRedeem={handleRedeemPoints}
                    onSkip={() => {
                        setShowPointsModal(false);
                        setShowPaymentModal(true);
                        setModoCanje(false);
                    }}
                    onClose={() => {
                        setShowPointsModal(false);
                        setModoCanje(false);
                    }}
                />
            )}

            <Modal
                visible={showNoPointsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNoPointsModal(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.proModal}>

                        {/* Icono */}
                        <View style={styles.proIconWrapper}>
                            <Ionicons name="warning-outline" size={46} color="#f97316" />
                        </View>

                        {/* Título */}
                        <Text style={styles.proTitle}>
                            Canje no disponible
                        </Text>

                        {/* Info */}
                        {noPointsInfo && (
                            <View style={styles.proInfoBox}>
                                <Text style={styles.proText}>
                                    Cliente: <Text style={styles.bold}>{noPointsInfo.nombre}</Text>
                                </Text>

                                <View style={styles.pointsRow}>
                                    <View style={styles.pointsChip}>
                                        <Ionicons name="star" size={16} color="#f59e0b" />
                                        <Text style={styles.pointsChipText}>
                                            {noPointsInfo.puntos} puntos
                                        </Text>
                                    </View>

                                    <Text style={styles.proArrow}>→</Text>

                                    <View style={[styles.pointsChip, styles.pointsChipNeeded]}>
                                        <Ionicons name="star" size={16} color="#ef4444" />
                                        <Text style={styles.pointsChipText}>
                                            {noPointsInfo.min} necesarios
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.proSubText}>
                                    Le faltan <Text style={styles.bold}>{noPointsInfo.faltan}</Text> puntos para poder canjear.
                                </Text>
                            </View>
                        )}

                        {/* Acciones */}
                        <View style={styles.proActions}>
                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => setShowNoPointsModal(false)}
                            >
                                <Text style={styles.secondaryBtnText}>Cerrar</Text>
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => {
                                    setShowNoPointsModal(false);
                                    setShowPaymentModal(true);
                                }}
                            >
                                <Ionicons name="card-outline" size={20} color="#fff" />
                                <Text style={styles.primaryBtnText}>Continuar a pago</Text>
                            </TouchableOpacity>
                            */}
                        </View>

                    </View>
                </View>
            </Modal>

        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
    },

    // TICKET PANEL (Izquierda)
    ticketPanel: {
        width: 420,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    ticketHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    ticketTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    ticketInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mesaText: {
        fontSize: 14,
        color: '#6b7280',
    },
    ticketItems: {
        flex: 1,
        padding: 16,
    },
    emptyTicket: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9ca3af',
    },
    ticketTableHeader: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: 12,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    ticketItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        position: 'relative',
    },
    ticketItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingRight: 32,
    },
    ticketItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    ticketItemSize: {
        fontSize: 12,
        color: '#9ca3af',
    },
    ticketExtras: {
        marginTop: 4,
    },
    ticketExtraText: {
        fontSize: 11,
        color: '#D4D8C9',
    },
    ticketItemQuantity: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    qtyBtn: {
        width: 20,
        height: 20,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        minWidth: 20,
        textAlign: 'center',
    },
    ticketItemPrice: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'right',
    },
    ticketItemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'right',
    },
    deleteBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        padding: 4,
        zIndex: 1,
    },
    ticketFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    payButton: {
        backgroundColor: '#22c55e',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    pointsButton:{
        backgroundColor: '#3b82f6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // PRODUCTS PANEL (Derecha)
    productsPanel: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    topBar: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    categoriesScroll: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        maxHeight: 56,
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryChipActive: {
        backgroundColor: '#5b79f5',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    productsScroll: {
        flex: 1,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    productCard: {
        width: '23%',
        minWidth: 180,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productImageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f9fafb',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    productEmoji: {
        fontSize: 48,
    },
    productInfo: {
        padding: 12,
        gap: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    proModal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: 420,
    },
    proIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    proTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    proInfoBox: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    proText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
    },
    bold: {
        fontWeight: 'bold',
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginVertical: 12,
    },
    pointsChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pointsChipNeeded: {
        backgroundColor: '#fee2e2',
    },
    pointsChipText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#374151',
    },
    proArrow: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    proSubText: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
    },
    proActions: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    primaryBtn: {
        flex: 1.2,
        backgroundColor: '#22c55e',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },


});

export default POSScreen;