// src/components/Header.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ currentView, onViewChange }) => {
    return (
        <View style={styles.header}>
            <View style={styles.left}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1f2937" />
                    <Text style={styles.backText}></Text>
                </TouchableOpacity>
            </View>

            <View style={styles.center}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, currentView === 'pos' && styles.tabActive]}
                        onPress={() => onViewChange('pos')}
                    >
                        <Ionicons
                            name="receipt"
                            size={20}
                            color={currentView === 'pos' ? '#5b79f5' : '#6b7280'}
                        />
                        <Text style={[styles.tabText, currentView === 'pos' && styles.tabTextActive]}>
                            Recibo
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, currentView === 'ventas' && styles.tabActive]}
                        onPress={() => onViewChange('ventas')}
                    >
                        <Ionicons
                            name="bar-chart"
                            size={20}
                            color={currentView === 'ventas' ? '#5b79f5' : '#6b7280'}
                        />
                        <Text style={[styles.tabText, currentView === 'ventas' && styles.tabTextActive]}>
                            Ventas
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.right}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={24} color="#1f2937" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="menu" size={24} color="#1f2937" />
                </TouchableOpacity>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>Vale</Text>
                    <View style={styles.lockIcon}>
                        <Ionicons name="lock-closed" size={16} color="#6b7280" />
                    </View>
                </View>
                <View style={styles.statusIndicator} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    left: {
        flex: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backText: {
        fontSize: 16,
        color: '#1f2937',
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#5b79f5',
    },
    right: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    lockIcon: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22c55e',
    },
});

export default Header;