// src/components/Header.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ currentView, onViewChange }) => {
    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.logo}>
                    <View style={styles.logoIcon}>
                        <Text style={styles.logoEmoji}>🧋</Text>
                    </View>
                    <View>
                        <Text style={styles.title}>Nonas Tapioca</Text>
                        <Text style={styles.subtitle}>Sistema de Punto de Venta</Text>
                    </View>
                </View>

                <View style={styles.nav}>
                    <TouchableOpacity
                        style={[styles.navButton, currentView === 'pos' && styles.navButtonActive]}
                        onPress={() => onViewChange('pos')}
                    >
                        <Ionicons
                            name="home"
                            size={20}
                            color={currentView === 'pos' ? '#fff' : '#374151'}
                        />
                        <Text style={[styles.navButtonText, currentView === 'pos' && styles.navButtonTextActive]}>
                            Venta
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, currentView === 'ventas' && styles.navButtonActive]}
                        onPress={() => onViewChange('ventas')}
                    >
                        <Ionicons
                            name="bar-chart"
                            size={20}
                            color={currentView === 'ventas' ? '#fff' : '#374151'}
                        />
                        <Text style={[styles.navButtonText, currentView === 'ventas' && styles.navButtonTextActive]}>
                            Ventas
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 4,
        borderBottomColor: '#D4D8C9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50, // Para iOS status bar
    },
    logo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#D4D8C9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEmoji: {
        fontSize: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D4D8C9',
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    nav: {
        flexDirection: 'row',
        gap: 8,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    navButtonActive: {
        backgroundColor: '#D4D8C9',
    },
    navButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    navButtonTextActive: {
        color: '#fff',
    },
});

export default Header;