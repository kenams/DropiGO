import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';
import { Role } from '../../types';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAppState();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const result = signIn(identifier, password);
    if (!result.ok) {
      setError(result.message ?? 'Erreur de connexion.');
    } else {
      setError('');
    }
  };

  const handleSignup = () => {
    const result = signUp({
      name,
      email,
      phone: phone || undefined,
      password,
      role,
      company: role === 'buyer' ? company : undefined,
    });
    if (!result.ok) {
      setError(result.message ?? 'Erreur d’inscription.');
    } else {
      setError('');
    }
  };

  return (
    <Screen scroll style={styles.container}>
      <Logo size={96} showWordmark={false} compact />
      <Text style={styles.title}>Compte DroPiPêche</Text>
      <Text style={styles.subtitle}>
        Accès sécurisé pour pêcheurs et acheteurs professionnels.
      </Text>

      <View style={styles.modeRow}>
        <GhostButton
          label={mode === 'login' ? 'Se connecter ✓' : 'Se connecter'}
          onPress={() => setMode('login')}
        />
        <GhostButton
          label={mode === 'signup' ? 'Créer un compte ✓' : 'Créer un compte'}
          onPress={() => setMode('signup')}
        />
      </View>

      <Card style={styles.card}>
        {mode === 'login' ? (
          <>
            <Field
              label="Email ou téléphone"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="ex: acheteur@domaine.com"
            />
            <Field
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              secureTextEntry
            />
            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton label="Se connecter" onPress={handleLogin} />

            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Comptes démo</Text>
              <Text style={styles.demoText}>Pêcheur : pecheur@dropipeche.demo</Text>
              <Text style={styles.demoText}>Acheteur : acheteur@dropipeche.demo</Text>
              <Text style={styles.demoText}>Mot de passe : demo123</Text>
            </View>
          </>
        ) : (
          <>
            <Field label="Nom complet" value={name} onChangeText={setName} />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Field
              label="Téléphone (optionnel)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Field
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Créer un mot de passe"
              secureTextEntry
            />

            <Text style={styles.sectionTitle}>Rôle</Text>
            <View style={styles.roleRow}>
              <GhostButton
                label={role === 'buyer' ? 'Acheteur ✓' : 'Acheteur'}
                onPress={() => setRole('buyer')}
              />
              <GhostButton
                label={role === 'fisher' ? 'Pêcheur ✓' : 'Pêcheur'}
                onPress={() => setRole('fisher')}
              />
            </View>

            {role === 'buyer' && (
              <Field
                label="Société"
                value={company}
                onChangeText={setCompany}
                placeholder="Nom de l’entreprise"
              />
            )}

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>KYC requis :</Text>
              <Tag label="Oui" tone="warning" />
            </View>

            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton label="Créer le compte" onPress={handleSignup} />
          </>
        )}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.caption,
    marginBottom: spacing.lg,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusLabel: {
    ...textStyles.bodyBold,
    color: colors.muted,
    fontSize: 13,
  },
  error: {
    ...textStyles.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  demoBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  demoTitle: {
    ...textStyles.bodyBold,
    marginBottom: spacing.xs,
  },
  demoText: {
    ...textStyles.caption,
  },
});
