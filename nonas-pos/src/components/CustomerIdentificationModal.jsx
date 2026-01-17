// src/components/CustomerIdentificationModal.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PaymentModal from "./PaymentModal";

const CustomerIdentificationModal = ({ visible, onClose, onCustomerIdentified, onSkip }) => {
    const [step, setStep] = useState('ask'); // ask, search, register
    const [searchType, setSearchType] = useState('phone'); // phone, qr
    const [phoneNumber, setPhoneNumber] = useState('');
    const [searching, setSearching] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Datos de registro
    const [registerData, setRegisterData] = useState({
        nombre: '',
        telefono: '',
        email: ''
    });

    const handleSearch = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            alert('Ingresa un teléfono válido (10 dígitos)');
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`${API_URL}/clientes/telefono/${phoneNumber}`);

            if (response.ok) {
                const cliente = await response.json();
                onCustomerIdentified(cliente);
                resetModal();
            } else {
                // Cliente no encontrado, ofrecer registro
                alert('Cliente no encontrado. ¿Deseas registrarte?');
                setRegisterData({ ...registerData, telefono: phoneNumber });
                setStep('register');
            }
        } catch (error) {
            console.error('Error buscando cliente:', error);
            alert('Error al buscar cliente. Intenta de nuevo.');
        } finally {
            setSearching(false);
        }
    };

    const handleRegister = async () => {
        // Validaciones
        if (!registerData.nombre.trim()) {
            alert('El nombre es requerido');
            return;
        }
        if (!registerData.telefono || registerData.telefono.length < 10) {
            alert('Ingresa un teléfono válido (10 dígitos)');
            return;
        }
        if (!registerData.email.trim() || !registerData.email.includes('@')) {
            alert('Ingresa un email válido');
            return;
        }

        setRegistering(true);
        try {
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: registerData.nombre.trim(),
                    telefono: registerData.telefono,
                    email: registerData.email.trim().toLowerCase()
                })
            });

            if (response.ok) {
                const result = await response.json();

                // Aquí se enviaría el email con la tarjeta
                // Por ahora solo notificamos
                alert(`¡Bienvenido ${registerData.nombre}! Tu tarjeta de fidelidad ha sido enviada a ${registerData.email}`);

                // Buscar el cliente recién creado
                const clienteResponse = await fetch(`${API_URL}/clientes/qr/${result.uuid}`);
                if (clienteResponse.ok) {
                    const cliente = await clienteResponse.json();
                    onCustomerIdentified(cliente);
                }

                resetModal();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al registrar cliente');
            }
        } catch (error) {
            console.error('Error registrando cliente:', error);
            alert('Error al registrar. Intenta de nuevo.');
        } finally {
            setRegistering(false);
        }
    };

    const resetModal = () => {
        setStep('ask');
        setSearchType('phone');
        setPhoneNumber('');
        setRegisterData({ nombre: '', telefono: '', email: '' });
        onClose();
    };

    const handleSkipAndContinue = () => {
        resetModal();
        onSkip();
        setShowPaymentModal(true);
    }


    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={resetModal}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {step === 'ask' && '¿Eres miembro Nonas?'}
                            {step === 'search' && 'Identificar Cliente'}
                            {step === 'register' && 'Registro de Cliente'}
                        </Text>
                        <TouchableOpacity onPress={resetModal}>
                            <Ionicons name="close" size={28} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Paso 1: Preguntar si es miembro */}
                        {step === 'ask' && (
                            <View style={styles.askContainer}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="card" size={48} color="#9333ea" />
                                </View>
                                <Text style={styles.askText}>
                                    ¿Tienes tarjeta de fidelidad Nonas?
                                </Text>
                                <Text style={styles.askSubtext}>
                                    Acumula puntos en cada compra y obtén recompensas
                                </Text>

                                <View style={styles.buttonsContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.buttonPrimary]}
                                        onPress={() => setStep('search')}
                                    >
                                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                        <Text style={styles.buttonPrimaryText}>Sí, soy miembro</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.buttonSecondary]}
                                        onPress={() => setStep('register')}
                                    >
                                        <Ionicons name="person-add" size={24} color="#9333ea" />
                                        <Text style={styles.buttonSecondaryText}>Quiero registrarme</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.skipButton}
                                        onPress={handleSkipAndContinue}
                                    >
                                        <Text style={styles.skipText}>Continuar sin registro</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Paso 2: Buscar cliente */}
                        {step === 'search' && (
                            <View style={styles.searchContainer}>
                                <Text style={styles.sectionTitle}>Identifícate con:</Text>

                                {/* Opciones de búsqueda */}
                                <View style={styles.searchOptions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.searchOption,
                                            searchType === 'phone' && styles.searchOptionActive
                                        ]}
                                        onPress={() => setSearchType('phone')}
                                    >
                                        <Ionicons
                                            name="call"
                                            size={24}
                                            color={searchType === 'phone' ? '#9333ea' : '#6b7280'}
                                        />
                                        <Text style={[
                                            styles.searchOptionText,
                                            searchType === 'phone' && styles.searchOptionTextActive
                                        ]}>
                                            Teléfono
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.searchOption,
                                            searchType === 'qr' && styles.searchOptionActive
                                        ]}
                                        onPress={() => setSearchType('qr')}
                                    >
                                        <Ionicons
                                            name="qr-code"
                                            size={24}
                                            color={searchType === 'qr' ? '#9333ea' : '#6b7280'}
                                        />
                                        <Text style={[
                                            styles.searchOptionText,
                                            searchType === 'qr' && styles.searchOptionTextActive
                                        ]}>
                                            Escanear QR
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Búsqueda por teléfono */}
                                {searchType === 'phone' && (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Número de teléfono:</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="10 dígitos"
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            placeholderTextColor="#9ca3af"
                                        />
                                        <TouchableOpacity
                                            style={[styles.searchButton, searching && styles.searchButtonDisabled]}
                                            onPress={handleSearch}
                                            disabled={searching}
                                        >
                                            {searching ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <>
                                                    <Ionicons name="search" size={20} color="#fff" />
                                                    <Text style={styles.searchButtonText}>Buscar</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Escanear QR */}
                                {searchType === 'qr' && (
                                    <View style={styles.qrContainer}>
                                        <Ionicons name="qr-code" size={120} color="#d1d5db" />
                                        <Text style={styles.qrText}>
                                            Función de escaneo QR próximamente
                                        </Text>
                                        <Text style={styles.qrSubtext}>
                                            Por ahora usa el teléfono
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => setStep('ask')}
                                >
                                    <Ionicons name="arrow-back" size={20} color="#6b7280" />
                                    <Text style={styles.backButtonText}>Regresar</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Paso 3: Registro */}
                        {step === 'register' && (
                            <View style={styles.registerContainer}>
                                <Text style={styles.sectionTitle}>Crea tu cuenta Nonas</Text>
                                <Text style={styles.sectionSubtitle}>
                                    Recibirás tu tarjeta digital por email
                                </Text>

                                <View style={styles.formContainer}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Nombre completo *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ej: María García"
                                            value={registerData.nombre}
                                            onChangeText={(text) => setRegisterData({...registerData, nombre: text})}
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Teléfono (10 dígitos) *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="5512345678"
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            value={registerData.telefono}
                                            onChangeText={(text) => setRegisterData({...registerData, telefono: text})}
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Email *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="correo@ejemplo.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={registerData.email}
                                            onChangeText={(text) => setRegisterData({...registerData, email: text})}
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>

                                    <View style={styles.benefitsBox}>
                                        <Text style={styles.benefitsTitle}>🎁 Beneficios:</Text>
                                        <Text style={styles.benefitItem}>✓ 1 punto por cada $10</Text>
                                        <Text style={styles.benefitItem}>✓ Promociones exclusivas</Text>
                                        <Text style={styles.benefitItem}>✓ Regalo de cumpleaños</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.registerButton, registering && styles.registerButtonDisabled]}
                                        onPress={handleRegister}
                                        disabled={registering}
                                    >
                                        {registering ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                                <Text style={styles.registerButtonText}>Crear mi cuenta</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={() => setStep('ask')}
                                    >
                                        <Ionicons name="arrow-back" size={20} color="#6b7280" />
                                        <Text style={styles.backButtonText}>Regresar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Nota: Agregar esto al inicio del archivo o importarlo
const API_URL = 'http://192.168.0.103:3000/api';

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
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
    },
    content: {
        padding: 20,
    },

    // Ask step
    askContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f3e8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    askText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    askSubtext: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    buttonsContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonPrimary: {
        backgroundColor: '#9333ea',
    },
    buttonPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        backgroundColor: '#f3e8ff',
        borderWidth: 2,
        borderColor: '#9333ea',
    },
    buttonSecondaryText: {
        color: '#9333ea',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipText: {
        color: '#6b7280',
        fontSize: 14,
        textDecorationLine: 'underline',
    },

    // Search step
    searchContainer: {
        gap: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    searchOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    searchOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    searchOptionActive: {
        backgroundColor: '#f3e8ff',
        borderColor: '#9333ea',
    },
    searchOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    searchOptionTextActive: {
        color: '#9333ea',
    },
    inputContainer: {
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    searchButton: {
        backgroundColor: '#9333ea',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    searchButtonDisabled: {
        opacity: 0.5,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    qrContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    qrText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 20,
    },
    qrSubtext: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    backButtonText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '600',
    },

    // Register step
    registerContainer: {
        gap: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    benefitsBox: {
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 8,
    },
    benefitItem: {
        fontSize: 13,
        color: '#166534',
        marginBottom: 4,
    },
    registerButton: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 12,
    },
    registerButtonDisabled: {
        opacity: 0.5,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomerIdentificationModal;