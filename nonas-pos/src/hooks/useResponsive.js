// src/hooks/useResponsive.js
import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

const getDeviceInfo = () => {
    const { width, height } = Dimensions.get('window');
    const isLandscape = width > height;
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);

    // Clasificación de dispositivo
    const isTablet = shortSide >= 600;
    const isLargeTablet = shortSide >= 900; // iPad Pro 12.9"
    const isPhone = !isTablet;
    const isSmallPhone = shortSide < 375;

    return {
        width,
        height,
        isLandscape,
        isPortrait: !isLandscape,
        isTablet,
        isLargeTablet,
        isPhone,
        isSmallPhone,

        // Helpers de layout
        // Cuántas columnas de productos mostrar
        productColumns: isLargeTablet ? 4 : isTablet ? 3 : isLandscape ? 3 : 2,

        // Ancho del panel de ticket
        ticketPanelWidth: isLargeTablet ? 460 : isTablet ? 380 : isLandscape ? 320 : '100%',

        // ¿Mostrar layout de dos columnas?
        showSplitLayout: isTablet || (isPhone && isLandscape),

        // Tamaños de fuente escalados
        fontScale: isLargeTablet ? 1.1 : isTablet ? 1.0 : isSmallPhone ? 0.85 : 0.9,

        // Espaciado
        spacing: isLargeTablet ? 20 : isTablet ? 16 : 12,
    };
};

export const useResponsive = () => {
    const [device, setDevice] = useState(getDeviceInfo());

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setDevice(getDeviceInfo());
        });
        return () => subscription?.remove();
    }, []);

    return device;
};