import { createHouseholdSchema } from '../lib/validation';

describe('Household Creation', () => {
  describe('Validation Schema', () => {
    it('should validate a valid household creation form', () => {
      const validForm = {
        name: 'Test Household',
        cleaningDay: 1,
      };

      const result = createHouseholdSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('should reject household name that is too short', () => {
      const invalidForm = {
        name: 'A',
        cleaningDay: 1,
      };

      const result = createHouseholdSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject invalid cleaning day', () => {
      const invalidForm = {
        name: 'Test Household',
        cleaningDay: 7, // Invalid day
      };

      const result = createHouseholdSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('between 0-6');
      }
    });

    it('should accept all valid cleaning days (0-6)', () => {
      for (let day = 0; day <= 6; day++) {
        const validForm = {
          name: 'Test Household',
          cleaningDay: day,
        };

        const result = createHouseholdSchema.safeParse(validForm);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Form Data Structure', () => {
    it('should have correct type structure', () => {
      const formData = {
        name: 'My Household',
        cleaningDay: 3,
      };

      // TypeScript should infer this correctly
      const typedFormData: typeof formData = formData;
      expect(typedFormData.name).toBe('My Household');
      expect(typedFormData.cleaningDay).toBe(3);
    });
  });
});
