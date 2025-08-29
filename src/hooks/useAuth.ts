import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from '../services/firestore';
import { useAppStore } from '../state/store';
import { User } from '../lib/types';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const { user, setUser, setLoading: setAppLoading } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await userService.getById(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // Create user profile if it doesn't exist
            const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              photoURL: firebaseUser.photoURL || null,
              notificationSettings: {
                weeklyReminder: true,
                lateDayNudge: true,
              },
            };
            const createdUser = await userService.create(newUser, firebaseUser.uid);
            setUser(createdUser);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser]);

  const signIn = async (email: string, password: string) => {
    setAppLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    } finally {
      setAppLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setAppLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email,
        displayName,
        notificationSettings: {
          weeklyReminder: true,
          lateDayNudge: true,
        },
      };
      await userService.create(newUser, firebaseUser.uid);
    } catch (error) {
      throw error;
    } finally {
      setAppLoading(false);
    }
  };

  const signOutUser = async () => {
    setAppLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    } finally {
      setAppLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await userService.update(user.id, updates);
      setUser({ ...user, ...updates });
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
    resetPassword,
    updateProfile,
  };
};
