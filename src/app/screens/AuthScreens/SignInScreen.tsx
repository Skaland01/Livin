import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, SignInForm } from '../../../lib/validation';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { colors } from '../../../theme/colors';
import { tokens } from '../../../theme/tokens';

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signIn, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInForm) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.dark.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: tokens.spacing.lg }}>
        <Card variant="elevated" style={{ marginBottom: tokens.spacing.xl }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes['3xl'],
              fontWeight: tokens.typography.weights.bold,
              color: colors.dark.textPrimary,
              textAlign: 'center',
              marginBottom: tokens.spacing.lg,
            }}
          >
            Welcome Back
          </Text>

          {error && (
            <View
              style={{
                backgroundColor: colors.dark.error,
                padding: tokens.spacing.md,
                borderRadius: tokens.borderRadius.sm,
                marginBottom: tokens.spacing.lg,
              }}
            >
              <Text
                style={{
                  color: colors.dark.bg,
                  fontSize: tokens.typography.sizes.sm,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: tokens.spacing.lg }}>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: tokens.typography.weights.medium,
                    color: colors.dark.textPrimary,
                    marginBottom: tokens.spacing.sm,
                  }}
                >
                  Email
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.dark.input,
                    borderRadius: tokens.borderRadius.sm,
                    padding: tokens.spacing.md,
                    fontSize: tokens.typography.sizes.base,
                    color: colors.dark.textPrimary,
                    borderWidth: 1,
                    borderColor: errors.email ? colors.dark.error : colors.dark.border,
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.dark.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <Text
                    style={{
                      color: colors.dark.error,
                      fontSize: tokens.typography.sizes.sm,
                      marginTop: tokens.spacing.xs,
                    }}
                  >
                    {errors.email.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: tokens.spacing.xl }}>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: tokens.typography.weights.medium,
                    color: colors.dark.textPrimary,
                    marginBottom: tokens.spacing.sm,
                  }}
                >
                  Password
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.dark.input,
                    borderRadius: tokens.borderRadius.sm,
                    padding: tokens.spacing.md,
                    fontSize: tokens.typography.sizes.base,
                    color: colors.dark.textPrimary,
                    borderWidth: 1,
                    borderColor: errors.password ? colors.dark.error : colors.dark.border,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.dark.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.password && (
                  <Text
                    style={{
                      color: colors.dark.error,
                      fontSize: tokens.typography.sizes.sm,
                      marginTop: tokens.spacing.xs,
                    }}
                  >
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={{ marginBottom: tokens.spacing.lg }}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword' as any)}
            style={{ alignItems: 'center', marginBottom: tokens.spacing.lg }}
          >
            <Text
              style={{
                color: colors.dark.accent,
                fontSize: tokens.typography.sizes.sm,
                fontWeight: tokens.typography.weights.medium,
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text
              style={{
                color: colors.dark.textSecondary,
                fontSize: tokens.typography.sizes.sm,
              }}
            >
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp' as any)}>
              <Text
                style={{
                  color: colors.dark.accent,
                  fontSize: tokens.typography.sizes.sm,
                  fontWeight: tokens.typography.weights.medium,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};
