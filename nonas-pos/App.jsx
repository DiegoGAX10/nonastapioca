// App.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ActivityIndicator, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './src/context/CartContext';
import { getProductos, getExtras, testConnection } from './src/services/api';
import { extractCategories } from './src/utils/helpers';
import Header from './src/components/Header';
import POSScreen from './src/screens/POSScreen';
import VentasScreen from './src/screens/VentasScreen';
import { useResponsive } from './src/hooks/useResponsive';

export default function App() {
  const device = useResponsive();
  const [currentView, setCurrentView] = useState('pos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isConnected = await testConnection();
      if (!isConnected) throw new Error('No se puede conectar con el servidor.');

      const [productosData, extrasData] = await Promise.all([getProductos(), getExtras()]);
      setProductos(productosData);
      setExtras(extrasData);
      setCategorias(extractCategories(productosData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#5b79f5" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        </SafeAreaView>
    );
  }

  if (error) {
    return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.centerContainer}>
            <View style={[styles.errorContainer, { maxWidth: device.isTablet ? 480 : 340 }]}>
              <Ionicons name="alert-circle" size={60} color="#ef4444" />
              <Text style={styles.errorTitle}>Error de Conexión</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
              <View style={styles.errorHintContainer}>
                <Text style={styles.errorHintTitle}>💡 Verifica:</Text>
                <Text style={styles.errorHint}>1. Backend corriendo: npm run dev</Text>
                <Text style={styles.errorHint}>2. IP correcta en src/services/api.js</Text>
                <Text style={styles.errorHint}>3. Misma red WiFi</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
    );
  }

  return (
      <CartProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <Header currentView={currentView} onViewChange={setCurrentView} />
          {currentView === 'pos' && (
              <POSScreen productos={productos} categorias={categorias} extras={extras} />
          )}
          {currentView === 'ventas' && <VentasScreen />}
        </SafeAreaView>
      </CartProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f3f4f6', padding: 20,
  },
  loadingText: { marginTop: 14, fontSize: 14, color: '#6b7280' },
  errorContainer: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28,
    width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginTop: 14, marginBottom: 8 },
  errorMessage: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  retryButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#5b79f5', paddingHorizontal: 22, paddingVertical: 12,
    borderRadius: 12, marginBottom: 16,
  },
  retryText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  errorHintContainer: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, width: '100%' },
  errorHintTitle: { fontSize: 13, fontWeight: 'bold', color: '#1f2937', marginBottom: 6 },
  errorHint: { fontSize: 12, color: '#6b7280', marginBottom: 3 },
});