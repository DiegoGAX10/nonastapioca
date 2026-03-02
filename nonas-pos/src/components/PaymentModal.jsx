// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';

const PaymentModal = ({ visible, onClose, onProcessPayment }) => {
    const { getTotal } = useCart();
    const [processing, setProcessing] = useState(false);
    const [showTransferScreen, setShowTransferScreen] = useState(false);
    const [referencia, setReferencia] = useState('');

    // CONFIGURA TUS DATOS BANCARIOS AQUÍ
    const DATOS_BANCARIOS = {
        banco: 'BBVA',
        clabe: '012 180 0150 3564 085 9',
        titular: 'Ilse Valeria Ortiz Guadarrama',
        Tarjeta: '4152313881111418'
    };

    const generateReferencia = () => {
        return `NT${Date.now().toString().slice(-8)}`;
    };

    const handlePaymentMethod = (method) => {
        if (method === 'transferencia') {
            setReferencia(generateReferencia());
            setShowTransferScreen(true);
        } else {
            handleDirectPayment(method);
        }
    };

    const handleDirectPayment = async (metodoPago) => {
        setProcessing(true);
        try {
            await onProcessPayment(metodoPago);
            resetState();
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmTransfer = async () => {
        setProcessing(true);
        try {
            await onProcessPayment('transferencia', referencia);
            resetState();
        } catch (error) {
            alert('Error al procesar transferencia');
        } finally {
            setProcessing(false);
        }
    };

    const resetState = () => {
        setShowTransferScreen(false);
        setReferencia('');
        onClose();
    };

    const copyToClipboard = (text, label) => {
        alert(`${label} copiado: ${text}`);
    };

    const shareTransferData = async () => {
        try {
            const message = `
Datos para Transferencia - Nonas Tapioca
━━━━━━━━━━━━━━━━━━━━━━━━
Banco: ${DATOS_BANCARIOS.banco}
CLABE: ${DATOS_BANCARIOS.clabe}
Beneficiario: ${DATOS_BANCARIOS.titular}
Monto: ${formatCurrency(getTotal())}
Referencia: ${referencia}
━━━━━━━━━━━━━━━━━━━━━━━━
            `.trim();
            await Share.share({ message });
        } catch (error) {
            console.error('Error compartiendo:', error);
        }
    };

    // ── PANTALLA DE TRANSFERENCIA ──────────────────────────────────────────
    if (showTransferScreen) {
        return (
            <Modal
                visible={visible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowTransferScreen(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Ionicons name="swap-horizontal" size={26} color="#9333ea" />
                                <View>
                                    <Text style={styles.title}>Transferencia SPEI</Text>
                                    <Text style={styles.subtitle}>Comparte los datos con el cliente</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowTransferScreen(false)}>
                                <Ionicons name="close" size={28} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Monto */}
                            <View style={styles.amountCard}>
                                <Text style={styles.amountLabel}>Total a transferir</Text>
                                <Text style={styles.amountValue}>{formatCurrency(getTotal())}</Text>
                            </View>

                            {/* Datos bancarios */}
                            <View style={styles.dataSection}>
                                <Text style={styles.sectionTitle}>Datos de transferencia</Text>

                                {[
                                    { label: 'Banco', value: DATOS_BANCARIOS.banco },
                                    { label: 'CLABE Interbancaria', value: DATOS_BANCARIOS.clabe, mono: true },
                                    { label: 'Beneficiario', value: DATOS_BANCARIOS.titular },
                                    { label: 'Referencia', value: referencia, mono: true },
                                ].map((item) => (
                                    <View key={item.label} style={styles.dataItem}>
                                        <Text style={styles.dataLabel}>{item.label}</Text>
                                        <View style={styles.dataValueRow}>
                                            <Text style={[styles.dataValue, item.mono && styles.monospace]}>
                                                {item.value}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.copyButton}
                                                onPress={() => copyToClipboard(item.value, item.label)}
                                            >
                                                <Ionicons name="copy-outline" size={18} color="#6b7280" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Advertencia */}
                            <View style={styles.warningBox}>
                                <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                                <Text style={styles.warningText}>
                                    Verifica el comprobante del cliente antes de confirmar la venta
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowTransferScreen(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmButton, processing && styles.confirmButtonDisabled]}
                                onPress={handleConfirmTransfer}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                        <Text style={styles.confirmButtonText}>Confirmar pago</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    // ── PANTALLA PRINCIPAL ─────────────────────────────────────────────────
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Método de Pago</Text>
                        <TouchableOpacity onPress={onClose} disabled={processing}>
                            <Ionicons name="close" size={28} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.amountCard}>
                        <Text style={styles.amountLabel}>Total a pagar</Text>
                        <Text style={styles.amountValue}>{formatCurrency(getTotal())}</Text>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.paymentButton, styles.efectivo]}
                            onPress={() => handlePaymentMethod('efectivo')}
                            disabled={processing}
                        >
                            {processing ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Ionicons name="cash" size={26} color="#fff" />
                                    <Text style={styles.buttonText}>Efectivo</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentButton, styles.transferencia]}
                            onPress={() => handlePaymentMethod('transferencia')}
                            disabled={processing}
                        >
                            <Ionicons name="swap-horizontal" size={26} color="#fff" />
                            <Text style={styles.buttonText}>Transferencia</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 480,
        maxHeight: '90%',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 2,
    },
    amountCard: {
        backgroundColor: '#f3e8ff',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#9333ea',
    },
    amountLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 6,
    },
    amountValue: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#9333ea',
    },
    buttons: {
        gap: 12,
    },
    paymentButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 18,
        borderRadius: 14,
    },
    efectivo: { backgroundColor: '#10b981' },
    transferencia: { backgroundColor: '#9333ea' },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },

    // ── Pantalla transferencia ──
    dataSection: {
        backgroundColor: '#f9fafb',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 14,
    },
    dataItem: {
        marginBottom: 14,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    dataLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 6,
    },
    dataValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dataValue: {
        fontSize: 15,
        color: '#1f2937',
        fontWeight: '500',
        flex: 1,
    },
    monospace: {
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    copyButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#9333ea',
        marginBottom: 14,
    },
    shareButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#9333ea',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#fef3c7',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fbbf24',
        marginBottom: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400e',
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6b7280',
    },
    confirmButton: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 12,
    },
    confirmButtonDisabled: { opacity: 0.5 },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentModal;