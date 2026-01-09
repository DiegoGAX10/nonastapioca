// src/screens/VentasScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getVentasHoy } from '../services/api';
import { formatCurrency, formatDateTime, getPaymentMethodClass } from '../utils/helpers';

const VentasScreen = () => {
    const [ventas, setVentas] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        cantidad: 0,
        promedio: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        try {
            const data = await getVentasHoy();
            setVentas(data);

            const total = data.reduce((sum, v) => sum + parseFloat(v.total), 0);
            const cantidad = data.length;
            const promedio = cantidad > 0 ? total / cantidad : 0;

            setEstadisticas({ total, cantidad, promedio });
        } catch (error) {
            console.error('Error cargando ventas:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarVentas();
    };

    const getPaymentColor = (method) => {
        const colors = {
            'efectivo': '#10b981',
            'tarjeta': '#3b82f6',
            'transferencia': '#D4D8C9',
            'wallet': '#ec4899'
        };
        return colors[method] || '#6b7280';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4D8C9" />
                <Text style={styles.loadingText}>Cargando ventas...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Estadísticas */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
                        <Ionicons name="cash" size={24} color="#10b981" />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statLabel}>Total Hoy</Text>
                        <Text style={styles.statValue}>{formatCurrency(estadisticas.total)}</Text>
                    </View>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                        <Ionicons name="cart" size={24} color="#3b82f6" />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statLabel}>Ventas</Text>
                        <Text style={styles.statValue}>{estadisticas.cantidad}</Text>
                    </View>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
                        <Ionicons name="trending-up" size={24} color="#D4D8C9" />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statLabel}>Promedio</Text>
                        <Text style={styles.statValue}>{formatCurrency(estadisticas.promedio)}</Text>
                    </View>
                </View>
            </View>

            {/* Lista de Ventas */}
            <View style={styles.salesContainer}>
                <View style={styles.salesHeader}>
                    <Text style={styles.salesTitle}>Ventas de Hoy</Text>
                    <TouchableOpacity onPress={cargarVentas}>
                        <Text style={styles.refreshButton}>Actualizar</Text>
                    </TouchableOpacity>
                </View>

                {ventas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bar-chart-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>No hay ventas registradas hoy</Text>
                    </View>
                ) : (
                    <View style={styles.salesList}>
                        {ventas.map((venta) => {
                            const { time } = formatDateTime(venta.creado_en);
                            return (
                                <View key={venta.id} style={styles.saleCard}>
                                    <View style={styles.saleHeader}>
                                        <View style={styles.saleMainInfo}>
                                            <Text style={styles.saleFolio}>{venta.folio}</Text>
                                            <Text style={styles.saleTime}>{time}</Text>
                                        </View>
                                        <Text style={styles.saleTotal}>{formatCurrency(venta.total)}</Text>
                                    </View>

                                    <View style={styles.saleFooter}>
                                        <View style={styles.saleTags}>
                                            <View style={[styles.tag, { backgroundColor: getPaymentColor(venta.metodo_pago) + '20' }]}>
                                                <Text style={[styles.tagText, { color: getPaymentColor(venta.metodo_pago) }]}>
                                                    {venta.metodo_pago.charAt(0).toUpperCase() + venta.metodo_pago.slice(1)}
                                                </Text>
                                            </View>
                                            <View style={styles.tag}>
                                                <Ionicons name="cube" size={12} color="#6b7280" />
                                                <Text style={styles.tagText}>{venta.items} items</Text>
                                            </View>
                                        </View>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusText}>{venta.estado}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    salesContainer: {
        margin: 16,
        marginTop: 0,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    salesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    salesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    refreshButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D4D8C9',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    salesList: {
        padding: 16,
        gap: 12,
    },
    saleCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    saleMainInfo: {
        flex: 1,
    },
    saleFolio: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    saleTime: {
        fontSize: 12,
        color: '#6b7280',
    },
    saleTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
    saleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    saleTags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#d1fae5',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#10b981',
        textTransform: 'capitalize',
    },
});

export default VentasScreen;