import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useChronicleStore } from '@/store/chronicleStore';
import { Colors } from '@/constants/theme';
import type { City } from '@/types/admin';

export default function CitiesIndex() {
  const cities = useChronicleStore((s) => s.cities);
  const states = useChronicleStore((s) => s.states);
  const removeCity = useChronicleStore((s) => s.removeCity);

  function getStateName(stateId: string) {
    return states.find((s) => s.id === stateId)?.acronym ?? '?';
  }

  function confirmDelete(city: City) {
    Alert.alert(
      'Excluir Cidade',
      `Tem certeza que deseja excluir "${city.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removeCity(city.id) },
      ]
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: Colors.primary, borderRadius: 32, paddingVertical: 12, gap: 8,
          }}
          onPress={() => router.push('/admin/cities/new')}
          accessibilityRole="button"
          accessibilityLabel="Nova cidade"
        >
          <Feather name="plus" size={16} color={Colors.onPrimary} />
          <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14, color: Colors.onPrimary }}>Nova Cidade</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 64 }}>
            <Feather name="map-pin" size={40} color={Colors.onSurfaceVariant} />
            <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, color: Colors.onSurfaceVariant, marginTop: 12 }}>
              Nenhuma cidade cadastrada
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 14,
            }}
          >
            <View
              style={{
                backgroundColor: Colors.surfaceContainerHigh, borderRadius: 8,
                paddingHorizontal: 8, paddingVertical: 4, marginRight: 12,
              }}
            >
              <Text style={{ fontFamily: 'WorkSans_700Bold', fontSize: 11, color: Colors.onSurfaceVariant }}>
                {getStateName(item.stateId)}
              </Text>
            </View>
            <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 15, color: Colors.primary, flex: 1 }}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/admin/cities/${item.id}`)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginRight: 16 }}
              accessibilityRole="button"
              accessibilityLabel={`Editar ${item.name}`}
            >
              <Feather name="edit-2" size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Excluir ${item.name}`}
            >
              <Feather name="trash-2" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
