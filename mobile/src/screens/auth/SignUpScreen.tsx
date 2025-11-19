/**
 * MoovUp Now - Sign Up Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, TextPresets } from '../../theme';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { SCREEN_NAMES } from '../../constants';
import * as authService from '../../services/auth';

export default function SignUpScreen({ navigation }: any) {
  const { signUp, signInWithGoogle, signInWithApple, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingUsername, setCheckingUsername] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const checkUsername = async (username: string) => {
    if (username.length < 3) return;

    setCheckingUsername(true);
    try {
      const available = await authService.isUsernameAvailable(username);
      if (!available) {
        setErrors((prev) => ({
          ...prev,
          username: 'Ce pseudo est déjà pris',
        }));
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Username
    if (!formData.username) {
      newErrors.username = 'Pseudo requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Minimum 3 caractères';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Lettres, chiffres et _ uniquement';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Doit contenir: majuscule, minuscule, chiffre';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      // Navigation vers onboarding se fera automatiquement
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>MoovUp Now</Text>
          <Text style={styles.subtitle}>Commence ton aventure ! 🚀</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Pseudo"
            placeholder="ton_pseudo"
            value={formData.username}
            onChangeText={(value) => updateField('username', value)}
            onBlur={() => checkUsername(formData.username)}
            error={errors.username}
            autoCapitalize="none"
            helperText="Visible par tous les utilisateurs"
          />

          <View style={styles.nameRow}>
            <Input
              label="Prénom (optionnel)"
              placeholder="Sophie"
              value={formData.firstName}
              onChangeText={(value) => updateField('firstName', value)}
              style={styles.halfInput}
            />
            <Input
              label="Nom (optionnel)"
              placeholder="Martin"
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
              style={styles.halfInput}
            />
          </View>

          <Input
            label="Email"
            placeholder="ton@email.com"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            error={errors.password}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={<Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
            helperText="Min 8 caractères, majuscule, minuscule, chiffre"
          />

          <Input
            label="Confirmer mot de passe"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            error={errors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            rightIcon={
              <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            }
            onRightIconPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />

          <Text style={styles.terms}>
            En créant un compte, tu acceptes nos{' '}
            <Text style={styles.termsLink}>Conditions d'utilisation</Text> et
            notre <Text style={styles.termsLink}>Politique de confidentialité</Text>
            .
          </Text>

          <Button
            title="Créer mon compte"
            onPress={handleSignUp}
            loading={loading || checkingUsername}
            fullWidth
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Sign Up */}
        <View style={styles.socialButtons}>
          <Button
            title="Continuer avec Google"
            variant="outline"
            onPress={handleGoogleSignUp}
            fullWidth
            icon={<Text style={styles.socialIcon}>G</Text>}
          />

          {Platform.OS === 'ios' && (
            <Button
              title="Continuer avec Apple"
              variant="outline"
              onPress={handleAppleSignUp}
              fullWidth
              icon={<Text style={styles.socialIcon}></Text>}
            />
          )}
        </View>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREEN_NAMES.AUTH_SIGN_IN)}
          >
            <Text style={styles.footerLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    ...TextPresets.h1,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...TextPresets.body,
    color: Colors.text.secondary,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  terms: {
    ...TextPresets.small,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginVertical: Spacing.md,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...TextPresets.small,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.md,
  },
  socialButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  footerText: {
    ...TextPresets.body,
    color: Colors.text.secondary,
  },
  footerLink: {
    ...TextPresets.bodyMedium,
    color: Colors.primary,
  },
});
