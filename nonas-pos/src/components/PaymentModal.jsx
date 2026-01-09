// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';

const PaymentModal = ({ visible, onClose, onProcessPayment }) => {
    const { getTotal } = useCart();
    const [processing, setProcessing] = useState(false);

    const handlePayment = async (metodoPago) => {
        setProcessing(true);
        try {
            await onProcessPayment(metodoPago);
        } finally {
            setProcessing(false);
        }
    };

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
                        <Text style={styles.title}>Método de Pago</Text>
                        <TouchableOpacity onPress={onClose} disabled={processing}>
                            <Ionicons name="close" size={28} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total a pagar:</Text>
                        <Text style={styles.totalAmount}>{formatCurrency(getTotal())}</Text>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.paymentButton, styles.efectivo]}
                            onPress={() => handlePayment('efectivo')}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="cash" size={24} color="#fff" />
                                    <Text style={styles.buttonText}>Efectivo</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentButton, styles.tarjeta]}
                            onPress={() => handlePayment('tarjeta')}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="card" size={24} color="#fff" />
                                    <Text style={styles.buttonText}>Tarjeta</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentButton, styles.transferencia]}
                            onPress={() => handlePayment('transferencia')}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="phone-portrait" size={24} color="#fff" />
                                    <Text style={styles.buttonText}>Transferencia</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentButton, styles.wallet]}
                            onPress={() => handlePayment('wallet')}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="wallet" size={24} color="#fff" />
                                    <Text style={styles.buttonText}>Wallet Digital</Text>
                                </>
                            )}
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
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    totalContainer: {
        backgroundColor: '#f3e8ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
    buttons: {
        gap: 12,
    },
    paymentButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 12,
    },
    efectivo: {
        backgroundColor: '#10b981',
    },
    tarjeta: {
        backgroundColor: '#3b82f6',
    },
    transferencia: {
        backgroundColor: '#D4D8C9',
    },
    wallet: {
        backgroundColor: '#ec4899',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentModal;