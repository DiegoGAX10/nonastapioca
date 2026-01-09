// App.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './src/context/CartContext';
import { getProductos, getExtras } from './src/services/api';
import { extractCategories } from './src/utils/helpers';
import Header from './src/components/Header';
import POSScreen from './src/screens/POSScreen';
import VentasScreen from './src/screens/VentasScreen';

export default function App() {
  const [currentView, setCurrentView] = useState('pos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productosData, extrasData] = await Promise.all([
        getProductos(),
        getExtras()
      ]);

      setProductos(productosData);
      setExtras(extrasData);
      setCategorias(extractCategories(productosData));

    } catch (err) {
      setError(err.message);
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D4D8C9" />
          <Text style={styles.loadingText}>Cargando datos del servidor...</Text>
        </View>
    );
  }

  // Pantalla de error
  if (error) {
    return (
        <View style={styles.centerContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Error de Conexión</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
            <Text style={styles.errorHint}>
              Verifica que el backend esté corriendo y que la IP sea correcta en src/services/api.js
            </Text>
          </View>
        </View>
    );
  }

  return (
      <CartProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <Header
              currentView={currentView}
              onViewChange={setCurrentView}
          />

          {currentView === 'pos' && (
              <POSScreen
                  productos={productos}
                  categorias={categorias}
                  extras={extras}
              />
          )}

          {currentView === 'ventas' && (
              <VentasScreen />
          )}
        </SafeAreaView>
      </CartProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4D8C9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});