// src/components/PointsRedemptionModal.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/helpers';

const PointsRedemptionModal = ({ visible, cliente, productos, onRedeem, onSkip, onClose }) => {
    const [recompensasDisponibles, setRecompensasDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (cliente && productos.length > 0) {
            calcularRecompensas();
        }
    }, [cliente, productos]);

    const calcularRecompensas = () => {
        const puntos = cliente.puntos || 0;
        const recompensas = [];

        // Definir rangos de puntos y sus productos disponibles
        const rangos = [
            { puntos: 45, valor: 45, nombre: 'Producto de $45' },
            { puntos: 55, valor: 55, nombre: 'Producto de $55' },
            { puntos: 65, valor: 65, nombre: 'Producto de $65' },
            { puntos: 75, valor: 75, nombre: 'Producto de $75' },
            {puntos: 85, valor: 75, nombre: 'Producto de $85'}
        ];

        rangos.forEach(rango => {
            if (puntos >= rango.puntos) {
                // Buscar productos que coincidan con este valor
                const productosDisponibles = productos.filter(p =>
                    p.precio_unico == rango.valor ||
                    p.precio_chico == rango.valor ||
                    p.precio_grande == rango.valor
                );

                if (productosDisponibles.length > 0) {
                    recompensas.push({
                        puntosNecesarios: rango.puntos,
                        valor: rango.valor,
                        nombre: rango.nombre,
                        productos: productosDisponibles,
                        icono: getRewardIcon(rango.puntos)
                    });
                }
            }
        });

        setRecompensasDisponibles(recompensas);
    };

    const getRewardIcon = (puntos) => {
        const icons = {
            45: '',
            55: '',
            65: '',
            75: '',
            85:''
        };
        return icons[puntos] || '🎁';
    };

    const handleRedeem = async (recompensa) => {
        setLoading(true);
        try {
            await onRedeem(recompensa, cliente);
        } catch (error) {
            console.error('Error al canjear puntos:', error);
            alert('Error al canjear puntos');
        } finally {
            setLoading(false);
        }
    };

    if (!cliente) return null;

    const puntosActuales = cliente.puntos || 0;
    const tieneRecompensas = recompensasDisponibles.length > 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.title}>¡Hola {cliente.nombre}!</Text>
                            <View style={styles.pointsBadge}>
                                <Ionicons name="star" size={20} color="#f59e0b" />
                                <Text style={styles.pointsText}>{puntosActuales} puntos</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {!tieneRecompensas ? (
                            // No hay recompensas disponibles
                            <View style={styles.noRewardsContainer}>
                                <View style={styles.noRewardsIcon}>
                                    <Text style={styles.noRewardsEmoji}>💰</Text>
                                </View>
                                <Text style={styles.noRewardsTitle}>
                                    Sigue acumulando puntos
                                </Text>
                                <Text style={styles.noRewardsSubtitle}>
                                    Necesitas al menos 45 puntos para canjear recompensas
                                </Text>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min((puntosActuales / 45) * 100, 100)}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {puntosActuales} / 45 puntos
                                </Text>
                            </View>
                        ) : (
                            // Mostrar recompensas disponibles
                            <>
                                <Text style={styles.sectionTitle}>
                                    ¿Deseas canjear tus puntos?
                                </Text>
                                <Text style={styles.sectionSubtitle}>
                                    Tienes {puntosActuales} puntos disponibles
                                </Text>

                                <View style={styles.rewardsList}>
                                    {recompensasDisponibles.map((recompensa, index) => (
                                        <View key={index} style={styles.rewardCard}>
                                            <View style={styles.rewardHeader}>
                                                <Text style={styles.rewardIcon}>{recompensa.icono}</Text>
                                                <View style={styles.rewardInfo}>
                                                    <Text style={styles.rewardName}>{recompensa.nombre}</Text>
                                                    <Text style={styles.rewardValue}>
                                                        Valor: {formatCurrency(recompensa.valor)}
                                                    </Text>
                                                </View>
                                                <View style={styles.pointsCost}>
                                                    <Ionicons name="star" size={16} color="#f59e0b" />
                                                    <Text style={styles.pointsCostText}>
                                                        {recompensa.puntosNecesarios}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={styles.productsLabel}>
                                                Productos disponibles ({recompensa.productos.length}):
                                            </Text>
                                            <View style={styles.productsList}>
                                                {recompensa.productos.slice(0, 3).map((producto, idx) => (
                                                    <Text key={idx} style={styles.productName}>
                                                        • {producto.nombre}
                                                    </Text>
                                                ))}
                                                {recompensa.productos.length > 3 && (
                                                    <Text style={styles.moreProducts}>
                                                        y {recompensa.productos.length - 3} más...
                                                    </Text>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                style={[styles.redeemButton, loading && styles.redeemButtonDisabled]}
                                                onPress={() => handleRedeem(recompensa)}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="#fff" />
                                                ) : (
                                                    <>
                                                        <Ionicons name="gift" size={20} color="#fff" />
                                                        <Text style={styles.redeemButtonText}>
                                                            Canjear {recompensa.puntosNecesarios} puntos
                                                        </Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}

                        {/* Botón para acumular */}
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={onSkip}
                            disabled={loading}
                        >
                            <Text style={styles.skipButtonText}>
                                Seguir acumulando puntos
                            </Text>
                        </TouchableOpacity>

                        {/* Info adicional */}
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#3b82f6" />
                            <Text style={styles.infoText}>
                                Al canjear, los puntos se descontarán de tu cuenta
                            </Text>
                        </View>
                    </ScrollView>
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
        maxWidth: 600,
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
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    pointsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    content: {
        padding: 20,
    },
    noRewardsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noRewardsIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    noRewardsEmoji: {
        fontSize: 48,
    },
    noRewardsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    noRewardsSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#f59e0b',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    rewardsList: {
        gap: 16,
    },
    rewardCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    rewardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    rewardIcon: {
        fontSize: 40,
    },
    rewardInfo: {
        flex: 1,
    },
    rewardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2,
    },
    rewardValue: {
        fontSize: 14,
        color: '#6b7280',
    },
    pointsCost: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    pointsCostText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    productsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    productsList: {
        marginBottom: 12,
    },
    productName: {
        fontSize: 13,
        color: '#4b5563',
        marginBottom: 4,
    },
    moreProducts: {
        fontSize: 13,
        color: '#9ca3af',
        fontStyle: 'italic',
    },
    redeemButton: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
    },
    redeemButtonDisabled: {
        opacity: 0.5,
    },
    redeemButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    skipButton: {
        marginTop: 20,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    skipButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#dbeafe',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#1e40af',
    },
});

export default PointsRedemptionModal;