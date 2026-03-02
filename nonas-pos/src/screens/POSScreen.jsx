// src/screens/POSScreen.jsx
import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Image, Modal, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductModal from '../components/ProductModal';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';
import CustomerIdentificationModal from '../components/CustomerIdentificationModal';
import { useCart } from '../context/CartContext';
import { crearVenta } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const CATEGORY_EMOJI = {
    'Boba':      '🧋',
    'Milk Boba': '🧋',
    'Shakes':    '🥤',
    'Sodas':     '🥤',
    'Snacks':    '🍿',
    'Postres':   '🧇',
    'Postres/Fresas_Con_Crema':   '🍓',
    'Café y Té': '☕',
};

const PRODUCT_EMOJI = {
    'Fresas con Crema': '🍓',
    'Bubble Waffle':    '🧇',
    'Maruchan Esquite':         '🍜',
    'Tostitos':         '🌮',
    'Boba Explosiva Mango': '🧋🥭',
    'Boba Explosiva Fresa': '🧋🍓',
    'Boba Explosiva Manzana Verde': '🧋🍏',
    'Boba Explosiva Mora Azul': '🧋🫐',
    'Soda Italiana Mango': '🥤🥭',
    'Soda Italiana Fresa': '🥤🍓',
    'Soda Italiana Manzana Verde': '🥤🍏',
    'Soda Italiana Mora Azul': '🥤🫐',
    'Cocoa Puff Shake': '🥤🍫',

};

const getCategoryEmoji = (categoria) => CATEGORY_EMOJI[categoria] || '🍽️';
import PointsRedemptionModal from '../components/PointsRedemptionModal';
import { canjearPuntos } from '../services/api';
import { useResponsive } from '../hooks/useResponsive';

const POSScreen = ({ productos, categorias, extras }) => {
    const device = useResponsive();
    const { cart, removeFromCart, updateQuantity, getTotal, clearCart, addToCart } = useCart();
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [saleSuccess, setSaleSuccess] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [clienteActual, setClienteActual] = useState(null);
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [showNoPointsModal, setShowNoPointsModal] = useState(false);
    const [noPointsInfo, setNoPointsInfo] = useState(null);
    const [modoCanje, setModoCanje] = useState(false);

    // En teléfono: alternar entre vista de productos y ticket
    const [mobileView, setMobileView] = useState('products'); // 'products' | 'ticket'

    const productosFiltrados = productos.filter(p => {
        const matchCategory = !categoriaSeleccionada || p.categoria === categoriaSeleccionada;
        return matchCategory;
    });

    const handleProcessPayment = async (metodoPago) => {
        try {
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
                empleado: 'Cajero',
                cliente_uuid: clienteActual?.uuid || null
            };

            const resultado = await crearVenta(ventaData);

            setSaleSuccess({
                folio: resultado.folio,
                total: resultado.total,
                metodoPago
            });

            setClienteActual(null);
            clearCart();
            setShowPaymentModal(false);
            if (!device.showSplitLayout) setMobileView('products');
        } catch (error) {
            alert('Error al procesar venta: ' + error.message);
        }
    };

    const handleRedeemPoints = async (recompensa, cliente) => {
        try {
            const prod = recompensa.productos[0];
            if (!prod) { alert('No hay productos disponibles'); return; }

            const resultado = await canjearPuntos(cliente.id, recompensa.puntosNecesarios);

            const productoGratis = { ...prod, precio_unico: 0, precio_chico: 0, precio_grande: 0 };
            let tamanoSeleccionado = 'unico';
            if (prod.tiene_tamanos) {
                tamanoSeleccionado = prod.precio_chico == recompensa.valor ? 'chico' : 'grande';
            }

            addToCart(productoGratis, tamanoSeleccionado, [], 1);
            setClienteActual({ ...cliente, puntos: resultado.puntos_restantes });
            alert(`¡${recompensa.puntosNecesarios} puntos canjeados! ${prod.nombre} agregado gratis`);
            setShowPointsModal(false);
            setShowPaymentModal(true);
        } catch (error) {
            alert('Error al canjear puntos: ' + error.message);
        }
    };

    const getTamanoLabel = (t) => ({ chico: 'Ch', grande: 'Gr', unico: '' }[t] || t);

    const fs = (size) => Math.round(size * device.fontScale);
    const sp = device.spacing;

    // ─── PANEL DE TICKET ───────────────────────────────────────────────────────
    const renderTicket = () => (
        <View style={[
            styles.ticketPanel,
            device.showSplitLayout
                ? { width: device.ticketPanelWidth }
                : styles.ticketPanelFullScreen
        ]}>

            {/* Header del ticket */}
            <View style={[styles.ticketHeader, { padding: sp }]}>
                <View style={styles.ticketHeaderRow}>
                    <Text style={[styles.ticketTitle, { fontSize: fs(20) }]}>Ticket</Text>
                    {/* Botón volver en móvil */}
                    {!device.showSplitLayout && (
                        <TouchableOpacity
                            style={styles.backToProductsBtn}
                            onPress={() => setMobileView('products')}
                        >
                            <Ionicons name="arrow-back" size={20} color="#6b7280" />
                            <Text style={styles.backToProductsText}>Productos</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {clienteActual && (
                    <View style={styles.clienteBadge}>
                        <Ionicons name="person-circle" size={16} color="#9333ea" />
                        <Text style={styles.clienteText}>
                            {clienteActual.nombre} · {clienteActual.puntos} pts
                        </Text>
                    </View>
                )}
            </View>

            {/* Items */}
            <ScrollView style={styles.ticketItems} showsVerticalScrollIndicator={false}>
                {cart.length === 0 ? (
                    <View style={styles.emptyTicket}>
                        <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                        <Text style={[styles.emptyText, { fontSize: fs(14) }]}>Sin productos</Text>
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
                                <View style={[styles.ticketItemRow, { paddingRight: 32 }]}>
                                    <View style={{ flex: 2.5 }}>
                                        <Text style={[styles.ticketItemName, { fontSize: fs(13) }]} numberOfLines={2}>
                                            {item.nombre}
                                        </Text>
                                        <Text style={[styles.ticketItemSize, { fontSize: fs(11) }]}>
                                            {getTamanoLabel(item.tamano)}
                                        </Text>
                                        {item.extras.length > 0 && (
                                            <View>
                                                {item.extras.map((e, i) => (
                                                    <Text key={i} style={[styles.ticketExtraText, { fontSize: fs(10) }]}>
                                                        {e.nombre}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                    <View style={[styles.ticketItemQuantity, { flex: 0.8 }]}>
                                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                                            <Ionicons name="remove" size={14} color="#6b7280" />
                                        </TouchableOpacity>
                                        <Text style={[styles.qtyText, { fontSize: fs(13) }]}>{item.cantidad}</Text>
                                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                                            <Ionicons name="add" size={14} color="#6b7280" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={[styles.ticketItemPrice, { flex: 1, fontSize: fs(12) }]}>
                                        {formatCurrency(item.precio)}
                                    </Text>
                                    <Text style={[styles.ticketItemTotal, { flex: 1, fontSize: fs(13) }]}>
                                        {formatCurrency(item.subtotal)}
                                    </Text>
                                </View>

                                <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
                                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.ticketFooter, { padding: sp }]}>
                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { fontSize: fs(16) }]}>Total</Text>
                    <Text style={[styles.totalAmount, { fontSize: fs(22) }]}>{formatCurrency(getTotal())}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.payButton, cart.length === 0 && styles.payButtonDisabled]}
                    onPress={() => { setModoCanje(false); setShowCustomerModal(true); }}
                    disabled={cart.length === 0}
                >
                    <Ionicons name="card" size={18} color="#fff" />
                    <Text style={[styles.payButtonText, { fontSize: fs(15) }]}>Pagar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.pointsButton}
                    onPress={() => { setModoCanje(true); setShowCustomerModal(true); }}
                >
                    <Ionicons name="star" size={18} color="#fff" />
                    <Text style={[styles.payButtonText, { fontSize: fs(15) }]}>Canjear Puntos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ─── PANEL DE PRODUCTOS ────────────────────────────────────────────────────
    const renderProducts = () => {
        const numColumns = device.productColumns;
        const cardWidth = `${Math.floor(100 / numColumns) - 1.5}%`;

        return (
            <View style={styles.productsPanel}>
                {/* Categorías */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={[styles.categoriesContainer, { paddingHorizontal: sp }]}
                >
                    <TouchableOpacity
                        style={[styles.categoryChip, !categoriaSeleccionada && styles.categoryChipActive]}
                        onPress={() => setCategoriaSeleccionada(null)}
                    >
                        <Text style={[styles.categoryChipText, !categoriaSeleccionada && styles.categoryChipTextActive, { fontSize: fs(13) }]}>
                            Todos
                        </Text>
                    </TouchableOpacity>

                    {categorias.map(cat => (
                        <TouchableOpacity
                            key={`cat-${cat.id}`}
                            style={[styles.categoryChip, categoriaSeleccionada === cat.nombre && styles.categoryChipActive]}
                            onPress={() => setCategoriaSeleccionada(cat.nombre)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                categoriaSeleccionada === cat.nombre && styles.categoryChipTextActive,
                                { fontSize: fs(13) }
                            ]}>
                                {cat.nombre}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Grid de productos */}
                <ScrollView style={styles.productsScroll} showsVerticalScrollIndicator={false}>
                    <View style={[styles.productsGrid, { padding: sp / 2, gap: sp / 1.5 }]}>
                        {productosFiltrados.map(producto => (
                            <TouchableOpacity
                                key={`prod-${producto.id}`}
                                style={[styles.productCard, { width: cardWidth }]}
                                onPress={() => {
                                    setProductoSeleccionado(producto);
                                    // En móvil, al agregar iremos al ticket
                                }}
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
                                            <Text style={styles.productEmoji}>
                                                {PRODUCT_EMOJI[producto.nombre] || getCategoryEmoji(producto.categoria)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View style={[styles.productInfo, { padding: sp / 1.5 }]}>
                                    <Text style={[styles.productName, { fontSize: fs(13) }]} numberOfLines={2}>
                                        {producto.nombre}
                                    </Text>
                                    <Text style={[styles.productPrice, { fontSize: fs(12) }]}>
                                        {producto.tiene_tamanos
                                            ? `Desde ${formatCurrency(producto.precio_chico)}`
                                            : formatCurrency(producto.precio_unico)
                                        }
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* Espacio extra abajo */}
                    <View style={{ height: 80 }} />
                </ScrollView>

                {/* FAB del carrito en móvil */}
                {!device.showSplitLayout && (
                    <TouchableOpacity
                        style={[styles.cartFab, cart.length === 0 && styles.cartFabEmpty]}
                        onPress={() => setMobileView('ticket')}
                    >
                        <Ionicons name="cart" size={24} color="#fff" />
                        {cart.length > 0 && (
                            <>
                                <Text style={styles.cartFabText}>{formatCurrency(getTotal())}</Text>
                                <View style={styles.cartFabBadge}>
                                    <Text style={styles.cartFabBadgeText}>{cart.length}</Text>
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // ─── RENDER PRINCIPAL ──────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {device.showSplitLayout ? (
                    // TABLET o PHONE LANDSCAPE: dos columnas
                    <>
                        {renderTicket()}
                        {renderProducts()}
                    </>
                ) : (
                    // PHONE PORTRAIT: una vista a la vez
                    mobileView === 'products' ? renderProducts() : renderTicket()
                )}

                {/* ── Modales ── */}
                <ProductModal
                    visible={!!productoSeleccionado}
                    producto={productoSeleccionado}
                    extras={extras}
                    onClose={() => {
                        setProductoSeleccionado(null);
                        // En móvil, ir al ticket tras agregar
                        if (!device.showSplitLayout) setMobileView('ticket');
                    }}
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

                        if (modoCanje) {
                            if (puntos >= MIN_PUNTOS) {
                                setShowPointsModal(true);
                            } else {
                                setNoPointsInfo({ nombre: cliente.nombre, puntos, faltan: MIN_PUNTOS - puntos, min: MIN_PUNTOS });
                                setShowNoPointsModal(true);
                            }
                            return;
                        }

                        if (puntos >= MIN_PUNTOS) {
                            setShowPointsModal(true);
                        } else {
                            setShowPaymentModal(true);
                        }
                    }}
                    onSkip={() => {
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
                        onSkip={() => { setShowPointsModal(false); setShowPaymentModal(true); setModoCanje(false); }}
                        onClose={() => { setShowPointsModal(false); setModoCanje(false); }}
                    />
                )}

                {/* Modal: sin puntos suficientes */}
                <Modal
                    visible={showNoPointsModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowNoPointsModal(false)}
                >
                    <View style={styles.overlay}>
                        <View style={[styles.proModal, { maxWidth: device.isTablet ? 420 : 340 }]}>
                            <View style={styles.proIconWrapper}>
                                <Ionicons name="warning-outline" size={46} color="#f97316" />
                            </View>
                            <Text style={[styles.proTitle, { fontSize: fs(20) }]}>Canje no disponible</Text>

                            {noPointsInfo && (
                                <View style={styles.proInfoBox}>
                                    <Text style={[styles.proText, { fontSize: fs(13) }]}>
                                        Cliente: <Text style={styles.bold}>{noPointsInfo.nombre}</Text>
                                    </Text>
                                    <View style={styles.pointsRow}>
                                        <View style={styles.pointsChip}>
                                            <Ionicons name="star" size={16} color="#f59e0b" />
                                            <Text style={styles.pointsChipText}>{noPointsInfo.puntos} puntos</Text>
                                        </View>
                                        <Text style={styles.proArrow}>→</Text>
                                        <View style={[styles.pointsChip, styles.pointsChipNeeded]}>
                                            <Ionicons name="star" size={16} color="#ef4444" />
                                            <Text style={styles.pointsChipText}>{noPointsInfo.min} necesarios</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.proSubText, { fontSize: fs(12) }]}>
                                        Le faltan <Text style={styles.bold}>{noPointsInfo.faltan}</Text> puntos para canjear.
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => setShowNoPointsModal(false)}
                            >
                                <Text style={styles.secondaryBtnText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#f3f4f6' },

    // ── TICKET ──────────────────────────────────────────────
    ticketPanel: {
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    ticketPanelFullScreen: {
        flex: 1,
    },
    ticketHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    ticketHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketTitle: { fontWeight: 'bold', color: '#1f2937' },
    backToProductsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    backToProductsText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
    clienteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f3e8ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    clienteText: { fontSize: 12, color: '#9333ea', fontWeight: '600' },

    ticketItems: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
    emptyTicket: { justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 12, color: '#9ca3af' },

    ticketTableHeader: {
        flexDirection: 'row',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: 10,
    },
    tableHeaderText: { fontSize: 11, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },

    ticketItem: {
        marginBottom: 14,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        position: 'relative',
    },
    ticketItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    ticketItemName: { fontWeight: '600', color: '#1f2937', marginBottom: 2 },
    ticketItemSize: { color: '#9ca3af' },
    ticketExtraText: { color: '#D4D8C9' },
    ticketItemQuantity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
    qtyBtn: {
        width: 22, height: 22,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        justifyContent: 'center', alignItems: 'center',
    },
    qtyText: { fontWeight: '600', color: '#1f2937', minWidth: 18, textAlign: 'center' },
    ticketItemPrice: { color: '#6b7280', textAlign: 'right' },
    ticketItemTotal: { fontWeight: '600', color: '#1f2937', textAlign: 'right' },
    deleteBtn: { position: 'absolute', top: 2, right: 2, padding: 4 },

    ticketFooter: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 10,
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    totalLabel: { fontWeight: 'bold', color: '#1f2937' },
    totalAmount: { fontWeight: 'bold', color: '#1f2937' },
    payButton: {
        backgroundColor: '#22c55e',
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 12,
    },
    pointsButton: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 12,
    },
    payButtonDisabled: { backgroundColor: '#d1d5db' },
    payButtonText: { color: '#fff', fontWeight: 'bold' },

    // ── PRODUCTOS ────────────────────────────────────────────
    productsPanel: { flex: 1, backgroundColor: '#f9fafb' },
    categoriesScroll: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        maxHeight: 56,
    },
    categoriesContainer: {
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    categoryChipActive: { backgroundColor: '#5b79f5' },
    categoryChipText: { fontWeight: '500', color: '#6b7280' },
    categoryChipTextActive: { color: '#fff' },

    productsScroll: { flex: 1 },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productImageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#f9fafb' },
    productImage: { width: '100%', height: '100%' },
    productImagePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
    productEmoji: { fontSize: 40 },
    productInfo: { gap: 4 },
    productName: { fontWeight: '600', color: '#1f2937' },
    productPrice: { fontWeight: '600', color: '#6b7280' },

    // ── FAB CARRITO (móvil) ────────────────────────────────
    cartFab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#22c55e',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    cartFabEmpty: { backgroundColor: '#9ca3af' },
    cartFabText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cartFabBadge: {
        width: 22, height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },
    cartFabBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#22c55e' },

    // ── MODAL SIN PUNTOS ──────────────────────────────────
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        padding: 20,
    },
    proModal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
    },
    proIconWrapper: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#fff7ed',
        justifyContent: 'center', alignItems: 'center',
        alignSelf: 'center', marginBottom: 14,
    },
    proTitle: { fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 16 },
    proInfoBox: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginBottom: 18 },
    proText: { color: '#374151', marginBottom: 8 },
    bold: { fontWeight: 'bold' },
    pointsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginVertical: 10 },
    pointsChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    pointsChipNeeded: { backgroundColor: '#fee2e2' },
    pointsChipText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
    proArrow: { fontSize: 18, fontWeight: 'bold', color: '#6b7280' },
    proSubText: { color: '#6b7280', textAlign: 'center' },
    secondaryBtn: {
        borderWidth: 2, borderColor: '#e5e7eb',
        borderRadius: 12, paddingVertical: 13, alignItems: 'center',
    },
    secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
});

export default POSScreen;