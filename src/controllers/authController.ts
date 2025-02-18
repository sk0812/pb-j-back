import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
});

interface JWTPayload {
  userId: string;
  email: string;
}

const signToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || '';
  const expiresIn = '7d' as const;
  return jwt.sign(payload, secret, { expiresIn });
};

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const { email, password } = result.data;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return res.status(401).json({ error: authError.message });
      }

      // Get or create user in our database
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          firstName: '', // These will be updated later
          lastName: '', // These will be updated later
          supabaseId: authData.user.id,
        },
      });

      // Generate JWT token
      const payload: JWTPayload = { userId: user.id, email: user.email };
      const token = signToken(payload);

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  signup: async (req: Request, res: Response) => {
    try {
      const result = signupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }

      const { email, password, firstName, lastName, phoneNumber } = result.data;

      // Create user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // Create user in our database
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          phoneNumber,
          supabaseId: authData.user!.id,
        },
      });

      // Generate JWT token
      const payload: JWTPayload = { userId: user.id, email: user.email };
      const token = signToken(payload);

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  logout: async (_req: Request, res: Response) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
}; 