import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

/**
 * Passport OAuth Configuration
 *
 * Configures Passport with multiple OAuth providers (Google, GitHub).
 * Extend this file to add more providers as needed.
 */

// User interface matching your database schema
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  providerId: string;
  createdAt: Date;
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    // TODO: Replace with your database query
    // const user = await db.users.findById(id);
    const user = { id }; // Placeholder
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth callback:', profile.id);

        // TODO: Replace with your database logic
        // Check if user exists
        // let user = await db.users.findOne({ providerId: profile.id, provider: 'google' });

        // if (!user) {
        //   // Create new user
        //   user = await db.users.create({
        //     email: profile.emails?.[0]?.value,
        //     name: profile.displayName,
        //     avatar: profile.photos?.[0]?.value,
        //     provider: 'google',
        //     providerId: profile.id,
        //   });
        // }

        // Placeholder user
        const user: User = {
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || '',
          avatar: profile.photos?.[0]?.value,
          provider: 'google',
          providerId: profile.id,
          createdAt: new Date(),
        };

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('GitHub OAuth callback:', profile.id);

        // TODO: Replace with your database logic
        // let user = await db.users.findOne({ providerId: profile.id, provider: 'github' });

        // if (!user) {
        //   user = await db.users.create({
        //     email: profile.emails?.[0]?.value,
        //     name: profile.displayName || profile.username,
        //     avatar: profile.photos?.[0]?.value,
        //     provider: 'github',
        //     providerId: profile.id,
        //   });
        // }

        // Placeholder user
        const user: User = {
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || profile.username || '',
          avatar: profile.photos?.[0]?.value,
          provider: 'github',
          providerId: profile.id,
          createdAt: new Date(),
        };

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
