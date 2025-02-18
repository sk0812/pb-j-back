import { z } from 'zod';

// Validation schema for user profile
export const userProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  postcode: z.string().min(1, 'Postcode is required'),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Type for the response when fetching a profile
export type UserProfileResponse = UserProfile & {
  id: string;
  created_at: string;
  updated_at: string;
}; 