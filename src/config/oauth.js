import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
const googleStrategy = GoogleStrategy.Strategy;

passport.use(
  new googleStrategy(
    {
      clientID: process.env.G_CLIENT_ID,
      clientSecret: process.env.G_CLIENT_SECRET,
      //callbackURL: "/google/callback",
      callbackURL: process.env.NODE_ENV === "production"? "https://shopapp-rxl1.onrender.com/google/callback": "http://localhost:3000/google/callback"

    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      };

      // TODO: find or create user in DB
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
