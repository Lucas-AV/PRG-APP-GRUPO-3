import { useState } from 'react';
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
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
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
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.6,
    paddingLeft: 2,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    overflow: 'hidden',
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
      style={({ pressed }) => [row.wrap, !isLast && row.border, pressed && { backgroundColor: Colors.surfaceContainerLow }]}
      onPress={onPress}
    >
      <View style={[row.iconWrap, accent && row.iconAccent]}>
        <MaterialIcons name={icon} size={20} color={accent ? Colors.primary : Colors.outline} />
      </View>
      <View style={row.labelWrap}>
        <Text style={row.label}>{label}</Text>
        {subtitle && <Text style={row.subtitle}>{subtitle}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
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
        trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }}
        thumbColor="#ffffff"
        ios_backgroundColor={Colors.surfaceContainerHighest}
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
    borderBottomColor: Colors.surfaceContainerLow,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAccent: {
    backgroundColor: Colors.primaryContainer + '4D',
  },
  labelWrap: { flex: 1 },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 15,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
});

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLang = i18n.language as SupportedLanguage;

  const comingSoon = () =>
    Alert.alert(t('profile.inDevelopment'), t('profile.inDevelopmentMsg'), [{ text: 'OK' }]);

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
          <SettingsRow icon="loyalty" label={t('profile.rows.plans')} accent isLast onPress={() => router.push('/(account)/plans' as any)} />
        </SettingsSection>

        {/* Preferências */}
        <SettingsSection title={t('profile.sections.preferences')}>
          <SettingsRow icon="notifications" label={t('profile.rows.notifications')} onPress={comingSoon} />
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
          <SettingsRowToggle icon="fingerprint" label={t('profile.rows.biometrics')} value={biometrics} onValueChange={setBiometrics} isLast />
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceContainerLowest,
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
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
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
    borderBottomColor: Colors.surfaceContainerLow,
  },
  langRowActive: {
    // no background — checkmark is enough
  },
  langLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 16,
    color: Colors.onSurface,
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
    borderColor: Colors.outlineVariant,
  },
  cancelLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    color: Colors.onSurfaceVariant,
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
    color: Colors.onSurface,
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
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    shadowColor: '#000',
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
    backgroundColor: Colors.primaryContainer,
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
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
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
