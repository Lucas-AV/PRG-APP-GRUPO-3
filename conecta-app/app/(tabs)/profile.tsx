import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from '@/components/ui/role-badge';
import { useTranslation } from 'react-i18next';
import {
  changeLanguage,
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  SupportedLanguage,
} from '@/services/i18n';

type IconName = keyof typeof MaterialIcons.glyphMap;

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={section.wrap}>
      <Text style={section.title}>{title.toUpperCase()}</Text>
      <View style={section.card}>{children}</View>
    </View>
  );
}

const section = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  title: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.6,
    paddingLeft: 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});

interface RowProps {
  icon: IconName;
  label: string;
  subtitle?: string;
  onPress: () => void;
  accent?: boolean;
  isLast?: boolean;
}

function SettingsRow({ icon, label, subtitle, onPress, accent, isLast }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [row.wrap, !isLast && row.border, pressed && { backgroundColor: Colors.card }]}
      onPress={onPress}
    >
      <View style={[row.iconWrap, accent && row.iconAccent]}>
        <MaterialIcons name={icon} size={20} color={accent ? Colors.primary : Colors.outline} />
      </View>
      <View style={row.labelWrap}>
        <Text style={row.label}>{label}</Text>
        {subtitle && <Text style={row.subtitle}>{subtitle}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={Colors.inkMuted} />
    </Pressable>
  );
}

interface ToggleRowProps {
  icon: IconName;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
}

function SettingsRowToggle({ icon, label, value, onValueChange, isLast }: ToggleRowProps) {
  return (
    <View style={[row.wrap, !isLast && row.border]}>
      <View style={row.iconWrap}>
        <MaterialIcons name={icon} size={20} color={Colors.outline} />
      </View>
      <Text style={[row.label, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="#ffffff"
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.base,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAccent: {
    backgroundColor: Colors.brand + '15',
  },
  labelWrap: { flex: 1 },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 1,
  },
});

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLang = i18n.language as SupportedLanguage;

  useEffect(() => {
    SecureStore.getItemAsync('biometrics_enabled').then(v => setBiometrics(v === 'true'));
    SecureStore.getItemAsync('notifications_enabled').then(v => setNotifications(v === 'true'));
  }, []);

  const handleBiometrics = async (value: boolean) => {
    setBiometrics(value);
    await SecureStore.setItemAsync('biometrics_enabled', String(value));
  };

  const handleNotifications = async (value: boolean) => {
    setNotifications(value);
    await SecureStore.setItemAsync('notifications_enabled', String(value));
  };

  const handleLogout = () =>
    Alert.alert(t('profile.logoutAlert.title'), t('profile.logoutAlert.message'), [
      { text: t('profile.logoutAlert.cancel'), style: 'cancel' },
      {
        text: t('profile.logoutAlert.confirm'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);

  const handleLanguageSelect = async (lang: SupportedLanguage) => {
    setLangModalVisible(false);
    await changeLanguage(lang);
  };

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{t('profile.title')}</Text>
        <Text style={styles.topBrand}>Conecta</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Pressable
          style={({ pressed }) => [styles.profileCard, pressed && { opacity: 0.92 }]}
          onPress={() => router.push('/(account)/edit-profile' as any)}
        >
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name ?? 'Usuário'}</Text>
              <RoleBadge role={user?.role} />
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
              <Text style={styles.editLink}>{t('profile.editProfile')}</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
        </Pressable>

        {/* Conta */}
        <SettingsSection title={t('profile.sections.account')}>
          <SettingsRow icon="location-on" label={t('profile.rows.addresses')} accent onPress={() => router.push('/(account)/addresses' as any)} />
          <SettingsRow icon="payment" label={t('profile.rows.payments')} accent onPress={() => router.push('/(account)/payments' as any)} />
          <SettingsRow
            icon="loyalty"
            label={t('profile.rows.plans')}
            accent
            isLast={user?.role !== 'prestador'}
            onPress={() => router.push('/(account)/plans' as any)}
          />
          {user?.role === 'prestador' && (
            <SettingsRow
              icon="event-available"
              label="Minha Disponibilidade"
              accent
              isLast
              onPress={() => router.push('/(scheduling)/provider-availability' as any)}
            />
          )}
        </SettingsSection>

        {/* Preferências */}
        <SettingsSection title={t('profile.sections.preferences')}>
          <SettingsRowToggle icon="notifications" label={t('profile.rows.notifications')} value={notifications} onValueChange={handleNotifications} />
          <SettingsRow
            icon="language"
            label={t('profile.rows.language')}
            subtitle={LANGUAGE_LABELS[currentLang]}
            onPress={() => setLangModalVisible(true)}
          />
          <SettingsRowToggle icon="brightness-4" label={t('profile.rows.darkMode')} value={darkMode} onValueChange={setDarkMode} isLast />
        </SettingsSection>

        {/* Segurança */}
        <SettingsSection title={t('profile.sections.security')}>
          <SettingsRow icon="lock-reset" label={t('profile.rows.changePassword')} onPress={() => router.push('/(account)/change-password' as any)} />
          <SettingsRow icon="verified-user" label={t('profile.rows.privacy')} onPress={() => router.push('/(account)/privacy-security' as any)} />
          <SettingsRowToggle icon="fingerprint" label={t('profile.rows.biometrics')} value={biometrics} onValueChange={handleBiometrics} isLast />
        </SettingsSection>

        {/* Suporte & Legal */}
        <SettingsSection title={t('profile.sections.support')}>
          <SettingsRow icon="help" label={t('profile.rows.help')} onPress={() => router.push('/(account)/support' as any)} />
          <SettingsRow icon="description" label={t('profile.rows.terms')} onPress={() => router.push('/(account)/use-terms' as any)} />
          <SettingsRow
            icon="info"
            label={t('profile.rows.about')}
            isLast
            onPress={() => router.push('/(account)/about' as any)}
          />
        </SettingsSection>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="exit-to-app" size={22} color={Colors.error} />
          <Text style={styles.logoutLabel}>{t('profile.logout')}</Text>
        </Pressable>

        <Text style={styles.version}>{t('profile.version')}</Text>
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={modal.backdrop} onPress={() => setLangModalVisible(false)}>
          <View style={modal.sheet}>
            <View style={modal.handle} />
            <Text style={modal.title}>{t('profile.languageSelect.title')}</Text>
            <Text style={modal.subtitle}>{t('profile.languageSelect.message')}</Text>

            {SUPPORTED_LANGUAGES.map((lang, idx) => {
              const isActive = lang === currentLang;
              const isLast = idx === SUPPORTED_LANGUAGES.length - 1;
              return (
                <Pressable
                  key={lang}
                  style={({ pressed }) => [
                    modal.langRow,
                    !isLast && modal.langBorder,
                    isActive && modal.langRowActive,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => handleLanguageSelect(lang)}
                >
                  <Text style={[modal.langLabel, isActive && modal.langLabelActive]}>
                    {LANGUAGE_LABELS[lang]}
                  </Text>
                  {isActive && (
                    <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                  )}
                </Pressable>
              );
            })}

            <Pressable
              style={({ pressed }) => [modal.cancelBtn, pressed && { opacity: 0.75 }]}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={modal.cancelLabel}>{t('profile.languageSelect.cancel')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const modal = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl + Spacing.base,
    gap: Spacing.base,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
  },
  langBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  langRowActive: {
    // no background — checkmark is enough
  },
  langLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 16,
    color: Colors.ink,
  },
  langLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
  cancelBtn: {
    marginTop: Spacing.sm,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    color: Colors.inkMuted,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surface,
  },
  topTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  topBrand: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 16,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 20,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  profileInfo: { gap: 2 },
  profileName: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  editLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.base + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + '1A',
  },
  logoutLabel: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 15,
    color: Colors.error,
  },
  version: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.outlineVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: -Spacing.xl,
  },
});
