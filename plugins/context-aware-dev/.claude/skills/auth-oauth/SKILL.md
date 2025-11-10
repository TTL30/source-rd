---
name: auth-oauth
description: Implement OAuth 2.0 authentication with providers like Google, GitHub, and custom OAuth servers using Passport.js. Use when the user mentions OAuth, authentication, login, social login, Google auth, GitHub auth, or user authentication.
---

# OAuth Authentication Implementation Pattern

## When to Use This Skill

Use this skill when implementing:
- Social login (Google, GitHub, Facebook, etc.)
- OAuth 2.0 authentication flows
- Passport.js integration
- JWT token management
- Session management with OAuth

## Implementation Steps

### 1. Install Dependencies

```bash
npm install passport passport-google-oauth20 passport-github2
npm install express-session
npm install jsonwebtoken
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/express-session
```

### 2. Configure OAuth Providers

Create environment variables:

```bash
# .env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_random_session_secret
JWT_SECRET=your_jwt_secret
CALLBACK_URL=http://localhost:3000/auth/callback
```

### 3. Set Up Passport Configuration

See `passport-setup.ts` for complete Passport configuration with multiple providers.

### 4. Implement Authentication Routes

```typescript
// routes/auth.ts
import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.redirect('/');
  });
});

export default router;
```

### 5. Protect Routes with Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

export function ensureRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}
```

### 6. JWT Token Generation (Optional)

```typescript
// utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
```

## Best Practices

1. **Secure Secrets**: Store OAuth credentials in environment variables, never in code
2. **HTTPS Only**: Use HTTPS in production for OAuth callbacks
3. **State Parameter**: Use state parameter to prevent CSRF attacks
4. **Token Expiration**: Implement proper token refresh mechanisms
5. **User Data**: Store minimal user data, respect privacy
6. **Error Handling**: Provide clear error messages for auth failures
7. **Session Security**: Use secure session cookies with httpOnly and sameSite flags

## Session Configuration

```typescript
// server.ts
import session from 'express-session';

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
```

## Common OAuth Providers

### Google OAuth 2.0
- Scopes: `profile`, `email`, `openid`
- Auth URL: `https://accounts.google.com/o/oauth2/v2/auth`
- Token URL: `https://oauth2.googleapis.com/token`

### GitHub OAuth
- Scopes: `user`, `user:email`, `repo`
- Auth URL: `https://github.com/login/oauth/authorize`
- Token URL: `https://github.com/login/oauth/access_token`

### Microsoft/Azure AD
- Scopes: `openid`, `profile`, `email`, `User.Read`
- Uses OpenID Connect

## Testing OAuth Locally

1. Set up ngrok for HTTPS callback:
```bash
ngrok http 3000
```

2. Update callback URL in provider dashboard to ngrok URL

3. Test the OAuth flow in browser

4. Use provider's test accounts when available

## Reference Files

- `passport-setup.ts` - Complete Passport.js configuration
- `examples.md` - Additional authentication patterns
