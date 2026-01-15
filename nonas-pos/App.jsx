// App.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './src/context/CartContext';
import { getProductos, getExtras, testConnection } from './src/services/api';
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
      // Probar conexión primero
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté corriendo y la IP sea correcta.');
      }

      // Cargar datos
      const [productosData, extrasData] = await Promise.all([
        getProductos(),
        getExtras()
      ]);

      console.log('Productos cargados:', productosData.length);
      console.log('Primera producto ejemplo:', productosData[0]);
      console.log('Extras cargados:', extrasData.length);

      const categoriasExtraidas = extractCategories(productosData);
      console.log('Categorías extraídas:', categoriasExtraidas);

      setProductos(productosData);
      setExtras(extrasData);
      setCategorias(categoriasExtraidas);

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
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#D4D8C9" />
            <Text style={styles.loadingText}>Cargando datos del servidor...</Text>
            <Text style={styles.loadingHint}>Verificando conexión con API...</Text>
          </View>
        </View>
    );
  }

  // Pantalla de error
  if (error) {
    return (
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.centerContainer}>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={64} color="#ef4444" />
              <Text style={styles.errorTitle}>Error de Conexión</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
              <View style={styles.errorHintContainer}>
                <Text style={styles.errorHintTitle}>💡 Verifica:</Text>
                <Text style={styles.errorHint}>1. Backend corriendo: npm run dev</Text>
                <Text style={styles.errorHint}>2. IP correcta en src/services/api.js</Text>
                <Text style={styles.errorHint}>3. Misma red WiFi</Text>
                <Text style={styles.errorHint}>4. Firewall/antivirus apagado</Text>
              </View>
            </View>
          </View>
        </View>
    );
  }

  return (
      <CartProvider>
        <View style={styles.container}>
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
        </View>
      </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
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
  loadingHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
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
  errorHintContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  errorHintTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});