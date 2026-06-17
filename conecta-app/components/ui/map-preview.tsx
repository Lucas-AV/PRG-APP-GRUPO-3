/**
 * MapPreview — 100% gratuito, sem API key, sem cadastro.
 *
 * Geocodificação: Nominatim (OpenStreetMap, gratuito)
 * Mapa: OpenStreetMap embed URL carregado no WebView
 */
import { useEffect, useMemo, useRef, useState } from 'react';
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

interface Coords { lat: number; lng: number }

function buildNominatimQuery({ street, number, neighborhood, city, state, zipCode }: MapPreviewProps): string | null {
  if (zipCode && zipCode.replace(/\D/g, '').length === 8) {
    return zipCode.replace(/\D/g, '');
  }
  const parts: string[] = [];
  if (street) parts.push(number ? `${street} ${number}` : street);
  if (neighborhood) parts.push(neighborhood);
  if (city) parts.push(city);
  if (state) parts.push(state);
  return parts.length >= 2 ? parts.join(', ') : null;
}

/** OpenStreetMap embed URL — sem autenticação, sem API key */
function buildOsmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.008; // ~900m de raio
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export function MapPreview({
  street, number, neighborhood, city, state, zipCode, height = 140,
}: MapPreviewProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const lastQuery = useRef<string | null>(null);

  const query = useMemo(
    () => buildNominatimQuery({ street, number, neighborhood, city, state, zipCode }),
    [street, number, neighborhood, city, state, zipCode],
  );

  useEffect(() => {
    if (!query || query === lastQuery.current) return;
    lastQuery.current = query;

    let cancelled = false;
    setGeocoding(true);
    setCoords(null);
    setMapReady(false);

    const controller = new AbortController();
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`;

    fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'ConectaApp/1.0' } })
      .then(r => r.json())
      .then((data: any[]) => {
        if (!cancelled && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setGeocoding(false); });

    return () => { cancelled = true; controller.abort(); };
  }, [query]);

  const embedUrl = coords ? buildOsmEmbedUrl(coords.lat, coords.lng) : null;
  const hasAddress = !!(city || zipCode);
  const isLoading = geocoding || (!!embedUrl && !mapReady);

  return (
    <View style={[styles.wrapper, { height }]}>
      {/* Fallback — fica visível enquanto geocodifica ou sem endereço */}
      {!coords && (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          {[15, 42, 70, 95].map(top => (
            <View key={`h${top}`} style={[styles.gridLine, styles.hLine, { top: `${top}%` as any }]} />
          ))}
          {[20, 48, 75].map(left => (
            <View key={`v${left}`} style={[styles.gridLine, styles.vLine, { left: `${left}%` as any }]} />
          ))}
          <View style={[styles.street, { top: 35, transform: [{ rotate: '-8deg' }] }]} />
          <View style={[styles.street, { top: 82, transform: [{ rotate: '5deg' }] }]} />
          <View style={styles.fallbackCenter}>
            {geocoding ? (
              <ActivityIndicator color={Colors.brand} size="small" />
            ) : (
              <MaterialIcons
                name={hasAddress ? 'location-searching' : 'location-on'}
                size={32}
                color={hasAddress ? Colors.brand : Colors.inkMuted}
              />
            )}
          </View>
        </View>
      )}

      {/* OpenStreetMap embed */}
      {embedUrl && (
        <View style={StyleSheet.absoluteFill}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            scrollEnabled={false}
            bounces={false}
            onLoad={() => setMapReady(true)}
            onError={() => setMapReady(true)}
            originWhitelist={['https://*']}
            javaScriptEnabled
            domStorageEnabled={false}
            cacheEnabled
            // Desativa interação — é só preview
            injectedJavaScript={`
              document.body.style.pointerEvents='none';
              document.documentElement.style.pointerEvents='none';
              true;
            `}
          />
          {/* Overlay de carregamento do mapa */}
          {!mapReady && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator color={Colors.brand} size="small" />
            </View>
          )}
        </View>
      )}

      {/* Rótulo inferior */}
      <View style={styles.note}>
        <MaterialIcons
          name={mapReady ? 'my-location' : isLoading ? 'autorenew' : 'location-on'}
          size={13}
          color={Colors.brand}
        />
        <Text style={styles.noteText}>
          {mapReady
            ? 'Localização aproximada do endereço'
            : geocoding
            ? 'Buscando localização…'
            : embedUrl
            ? 'Carregando mapa…'
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
    borderColor: Colors.border + '33',
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
  fallback: { backgroundColor: '#e8f4f8' },
  gridLine: {
    position: 'absolute',
    backgroundColor: Colors.card,
    opacity: 0.6,
  },
  hLine: { left: 0, right: 0, height: 1 },
  vLine: { top: 0, bottom: 0, width: 1 },
  street: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 3,
    backgroundColor: Colors.card,
    opacity: 0.9,
  },
  fallbackCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    bottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
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
    color: Colors.brand,
    flex: 1,
  },
});
