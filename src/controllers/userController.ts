import { Response } from 'express';
import { userProfileSchema, UserProfile } from '../types/user';
import { AuthenticatedRequest } from '../types/express';
import { prisma } from '../lib/prisma';

export const userController = {
  // Get user profile
  getProfile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Update user profile
  updateProfile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = userProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const profileData: UserProfile = result.data;

      const profile = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          phoneNumber: profileData.phone_number,
          dateOfBirth: new Date(profileData.date_of_birth),
          postcode: profileData.postcode
        }
      });

      return res.status(200).json(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Create user profile
  createProfile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      
      if (!userId || !userEmail) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = userProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const profileData: UserProfile = result.data;

      const profile = await prisma.user.create({
        data: {
          id: userId,
          email: userEmail,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          phoneNumber: profileData.phone_number,
          dateOfBirth: new Date(profileData.date_of_birth),
          postcode: profileData.postcode
        }
      });

      return res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      return res.status(500).json({ error: 'Failed to create profile' });
    }
  }
}; 