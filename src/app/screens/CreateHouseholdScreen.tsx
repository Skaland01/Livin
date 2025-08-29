import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useHousehold } from '../../hooks/useHousehold';
import { createHouseholdSchema, CreateHouseholdForm } from '../../lib/validation';
import { RootStackParamList } from '../../lib/types';

type CreateHouseholdNavigationProp = StackNavigationProp<RootStackParamList, 'CreateHousehold'>;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const CreateHouseholdScreen: React.FC = () => {
  console.log('CreateHouseholdScreen rendered - FULL VERSION');
  const navigation = useNavigation<CreateHouseholdNavigationProp>();
  const { createHousehold, loading } = useHousehold();
  
  const [formData, setFormData] = useState<CreateHouseholdForm>({
    name: '',
    cleaningDay: 0,
  });
  
  const [errors, setErrors] = useState<Partial<CreateHouseholdForm>>({});

  const validateForm = (): boolean => {
    try {
      createHouseholdSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Partial<CreateHouseholdForm> = {};
      error.issues?.forEach((err: any) => {
        newErrors[err.path[0] as keyof CreateHouseholdForm] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createHousehold(formData.name, formData.cleaningDay);
      Alert.alert(
        'Success!',
        'Your household has been created successfully. You can now add rooms and invite members.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create household. Please try again.');
    }
  };

  const updateForm = (field: keyof CreateHouseholdForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.dark.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: tokens.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: tokens.spacing.xl }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.dark.card,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: tokens.spacing.lg,
            }}
          >
            <Text style={{ color: colors.dark.textPrimary, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          
          <Text style={{
            color: colors.dark.textPrimary,
            fontSize: tokens.typography.sizes['2xl'],
            fontWeight: tokens.typography.weights.bold,
            marginBottom: tokens.spacing.sm,
          }}>
            Create Household
          </Text>
          
          <Text style={{
            color: colors.dark.textSecondary,
            fontSize: tokens.typography.sizes.base,
            lineHeight: 22,
          }}>
            Set up your household to start managing cleaning tasks together with your roommates or family.
          </Text>
        </View>

        {/* Form Card */}
        <Card variant="elevated" padding="lg" style={{ marginBottom: tokens.spacing.xl }}>
          {/* Household Name */}
          <View style={{ marginBottom: tokens.spacing.lg }}>
            <Text style={{
              color: colors.dark.textPrimary,
              fontSize: tokens.typography.sizes.base,
              fontWeight: tokens.typography.weights.medium,
              marginBottom: tokens.spacing.sm,
            }}>
              Household Name
            </Text>
            
            <TextInput
              value={formData.name}
              onChangeText={(value) => updateForm('name', value)}
              placeholder="Enter household name"
              placeholderTextColor={colors.dark.textSecondary}
              style={{
                backgroundColor: colors.dark.input,
                borderRadius: tokens.borderRadius.md,
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
                color: colors.dark.textPrimary,
                fontSize: tokens.typography.sizes.base,
                borderWidth: 1,
                borderColor: errors.name ? colors.dark.error : colors.dark.border,
              }}
            />
            
            {errors.name && (
              <Text style={{
                color: colors.dark.error,
                fontSize: tokens.typography.sizes.sm,
                marginTop: tokens.spacing.sm,
              }}>
                {errors.name}
              </Text>
            )}
          </View>

          {/* Cleaning Day */}
          <View style={{ marginBottom: tokens.spacing.lg }}>
            <Text style={{
              color: colors.dark.textPrimary,
              fontSize: tokens.typography.sizes.base,
              fontWeight: tokens.typography.weights.medium,
              marginBottom: tokens.spacing.sm,
            }}>
              Cleaning Day
            </Text>
            
            <Text style={{
              color: colors.dark.textSecondary,
              fontSize: tokens.typography.sizes.sm,
              marginBottom: tokens.spacing.md,
            }}>
              Choose which day of the week cleaning tasks will be assigned
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => updateForm('cleaningDay', day.value)}
                  style={{
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.sm,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: formData.cleaningDay === day.value 
                      ? colors.dark.accent 
                      : colors.dark.input,
                    borderWidth: 1,
                    borderColor: formData.cleaningDay === day.value 
                      ? colors.dark.accent 
                      : colors.dark.border,
                  }}
                >
                  <Text style={{
                    color: formData.cleaningDay === day.value 
                      ? colors.dark.bg 
                      : colors.dark.textPrimary,
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: tokens.typography.weights.medium,
                  }}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Info Card */}
        <Card variant="outlined" padding="md" style={{ marginBottom: tokens.spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: colors.dark.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: tokens.spacing.sm,
              marginTop: 2,
            }}>
              <Text style={{ color: colors.dark.bg, fontSize: 12, fontWeight: 'bold' }}>i</Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.dark.textPrimary,
                fontSize: tokens.typography.sizes.sm,
                fontWeight: tokens.typography.weights.medium,
                marginBottom: tokens.spacing.xs,
              }}>
                What happens next?
              </Text>
              
              <Text style={{
                color: colors.dark.textSecondary,
                fontSize: tokens.typography.sizes.sm,
                lineHeight: 18,
              }}>
                After creating your household, you'll be able to add rooms, invite members with a join code, and start managing cleaning tasks together.
              </Text>
            </View>
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          title="Create Household"
          onPress={handleSubmit}
          loading={loading}
          disabled={!formData.name.trim()}
          size="lg"
          style={{ marginBottom: tokens.spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
