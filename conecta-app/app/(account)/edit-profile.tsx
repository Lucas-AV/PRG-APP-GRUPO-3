import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from '@/components/ui/role-badge';
import { usersApi } from '@/services/api';

export default function EditProfileScreen() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [birthdate, setBirthdate] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações do app.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const initials = name
    ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'U';

  const handleSave = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const updated = await usersApi.update(user.id, { name, email, phone }, token);
      await updateUser(updated);
      Alert.alert('Alterações salvas', 'Seu perfil foi atualizado com sucesso.', [{ text: 'OK' }]);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title="Editar Perfil" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                : <Text style={styles.avatarText}>{initials}</Text>}
            </View>
            <Pressable
              style={({ pressed }) => [styles.cameraBtn, pressed && { opacity: 0.8 }]}
              onPress={handlePickPhoto}
            >
              <MaterialIcons name="photo-camera" size={18} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.avatarHint}>Toque para alterar a foto</Text>
          <RoleBadge role={user?.role} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="Nome Completo"
            placeholder="Seu nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <InputField
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.row2col}>
            <View style={styles.col2}>
              <InputField
                label="Telefone"
                placeholder="(11) 98765-4321"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.col2}>
              <InputField
                label="Nascimento"
                placeholder="DD/MM/AAAA"
                value={birthdate}
                onChangeText={setBirthdate}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Address card */}
          <View>
            <Text style={styles.fieldLabel}>ENDEREÇO PRINCIPAL</Text>
            <Pressable
              style={({ pressed }) => [styles.addressCard, pressed && { backgroundColor: Colors.surfaceContainer }]}
              onPress={() => router.push('/(account)/addresses' as any)}
            >
              <View style={styles.addressIconWrap}>
                <MaterialIcons name="home" size={22} color={Colors.primary} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressStreet}>Adicionar endereço</Text>
                <Text style={styles.addressDetail}>Toque para cadastrar</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
            </Pressable>
          </View>
        </View>

        {/* Save */}
        <View style={styles.footer}>
          <GradientButton label={loading ? 'Salvando…' : 'Salvar Alterações'} onPress={handleSave} disabled={loading} />
          <Text style={styles.privacyNote}>
            Suas informações são tratadas de acordo com nossa Política de Privacidade.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  avatarSection: { alignItems: 'center', paddingTop: Spacing.xxl },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    color: Colors.primary,
    letterSpacing: -1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    resizeMode: 'cover',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarHint: {
    marginTop: Spacing.md,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  form: { gap: Spacing.xxl },
  row2col: { flexDirection: 'row', gap: Spacing.md },
  col2: { flex: 1 },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
    marginLeft: 2,
    marginBottom: Spacing.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  addressIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressStreet: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  addressDetail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  footer: { gap: Spacing.base },
  privacyNote: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.outline,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
    lineHeight: 18,
  },
});
