// src/components/SuccessModal.jsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, getPaymentMethodName } from '../utils/helpers';

const SuccessModal = ({ visible, saleData, onClose }) => {
    if (!saleData) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color="#10b981" />
                    </View>

                    <Text style={styles.title}>¡Venta Exitosa!</Text>
                    <Text style={styles.subtitle}>La venta se ha procesado correctamente</Text>

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Folio:</Text>
                            <Text style={styles.detailValue}>{saleData.folio}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Total:</Text>
                            <Text style={[styles.detailValue, styles.detailValueGreen]}>
                                {formatCurrency(saleData.total)}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Método:</Text>
                            <Text style={[styles.detailValue, styles.capitalize]}>
                                {getPaymentMethodName(saleData.metodoPago)}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Nueva Venta</Text>
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
        maxWidth: 400,
        padding: 32,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    details: {
        width: '100%',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    detailValueGreen: {
        color: '#10b981',
        fontSize: 16,
    },
    capitalize: {
        textTransform: 'capitalize',
    },
    button: {
        width: '100%',
        backgroundColor: '#D4D8C9',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SuccessModal;