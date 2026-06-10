/**
 * MapPreview — Componente de mapa real usando Leaflet.js + OpenStreetMap tiles.
 *
 * Geocodificação via Nominatim (API pública, sem API key).
 * Fallback visual simulado enquanto carrega ou em caso de erro.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

interface MapPreviewProps {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  height?: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

/** Build a query string for Nominatim from the available address parts */
function buildQuery(props: MapPreviewProps): string | null {
  const { street, number, neighborhood, city, state, zipCode } = props;

  // Prefer CEP for best accuracy
  if (zipCode && zipCode.replace(/\D/g, '').length === 8) {
    return zipCode.replace(/\D/g, '');
  }

  // Fall back to structured address string
  const parts: string[] = [];
  if (street) parts.push(number ? `${street} ${number}` : street);
  if (neighborhood) parts.push(neighborhood);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (parts.length >= 2) return parts.join(', ');

  return null;
}

/** Leaflet HTML that renders inside the WebView */
function buildLeafletHtml(lat: number, lng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${lat}, ${lng}],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Custom marker
    var icon = L.divIcon({
      className: '',
      html: '<div style="width:20px;height:20px;background:#4f46e5;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
  </script>
</body>
</html>`;
}

export function MapPreview({
  street,
  number,
  neighborhood,
  city,
  state,
  zipCode,
  height = 140,
}: MapPreviewProps) {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const lastQuery = useRef<string | null>(null);

  useEffect(() => {
    const query = buildQuery({ street, number, neighborhood, city, state, zipCode });
    if (!query || query === lastQuery.current) return;
    lastQuery.current = query;

    let cancelled = false;
    setGeocoding(true);
    setMapLoading(true);

    const controller = new AbortController();
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`;

    fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ConectaApp/1.0' },
    })
      .then(r => r.json())
      .then((data: any[]) => {
        if (!cancelled && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {/* silently fall back to static map */})
      .finally(() => {
        if (!cancelled) setGeocoding(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [zipCode, street, number, neighborhood, city, state]);

  const hasAddress = !!(city || zipCode);

  return (
    <View style={[styles.wrapper, { height }]}>
      {/* ── Real Leaflet map (shown when coords available) ── */}
      {coords && (
        <View style={StyleSheet.absoluteFill}>
          <WebView
            source={{ html: buildLeafletHtml(coords.lat, coords.lng) }}
            style={styles.webview}
            scrollEnabled={false}
            onLoad={() => setMapLoading(false)}
            onError={() => setMapLoading(false)}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled={false}
            cacheEnabled={false}
          />
          {/* Tile loading overlay */}
          {mapLoading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator color={Colors.primary} size="small" />
            </View>
          )}
        </View>
      )}

      {/* ── Fallback simulated map (shown while geocoding or no coords) ── */}
      {!coords && (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          {/* Grid lines */}
          {[15, 40, 70, 100].map(top => (
            <View key={`h${top}`} style={[styles.gridLine, styles.hLine, { top: `${top}%` as any }]} />
          ))}
          {[20, 45, 70].map(left => (
            <View key={`v${left}`} style={[styles.gridLine, styles.vLine, { left: `${left}%` as any }]} />
          ))}
          {/* Streets at angles */}
          <View style={[styles.street, { top: 35, transform: [{ rotate: '-8deg' }] }]} />
          <View style={[styles.street, { top: 80, transform: [{ rotate: '5deg' }] }]} />

          {/* Center icon */}
          <View style={styles.fallbackCenter}>
            {geocoding ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <MaterialIcons
                name={hasAddress ? 'location-searching' : 'location-on'}
                size={32}
                color={hasAddress ? Colors.primary : Colors.outline}
              />
            )}
          </View>
        </View>
      )}

      {/* ── Bottom note ── */}
      <View style={styles.note}>
        <MaterialIcons
          name={coords ? 'my-location' : geocoding ? 'autorenew' : 'location-on'}
          size={13}
          color={Colors.primary}
        />
        <Text style={styles.noteText}>
          {coords
            ? 'Localização aproximada do endereço'
            : geocoding
            ? 'Buscando localização…'
            : 'Preencha o CEP para ver no mapa'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#e8f4f8',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e8f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Fallback static map
  fallback: {
    backgroundColor: '#e8f4f8',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: Colors.surfaceContainerLowest,
    opacity: 0.6,
  },
  hLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  vLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  street: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 3,
    backgroundColor: Colors.surfaceContainerLowest,
    opacity: 0.9,
  },
  fallbackCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom note
  note: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  noteText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.primary,
    flex: 1,
  },
});
