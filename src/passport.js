const passport = require('passport');
const User = require('./db/models/User');
const {
    auth
} = require('./config');

const {
    Strategy: DiscordStrategy
} = require('passport-discord');
const {
    Strategy: FBStrategy
} = require('passport-facebook');
const {
    Strategy: VKStrategy
} = require('passport-vkontakte');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// passport.use(new FacebookStrategy({
//     ...auth.facebook,
//     callbackURL: '/api/auth/facebook/return',
//     proxy: true,
//     profileFields: ['displayName', 'email'],
// }, async (req, accessToken, refreshToken, profile, done) => {
//     try {
//         const {
//             displayName: name,
//             emails
//         } = profile;
//         const email = emails[0].value;
//         const user = await oauthLogin(email, name);
//         done(null, user);
//     } catch (err) {
//         done(err);
//     }
// }));

passport.use(new DiscordStrategy({
    clientID: auth.discord.id,
    clientSecret: auth.discord.secret,
    callbackURL: '/api/auth/discordCallback',
    proxy: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        logger.info({
            profile,
            refreshToken,
            accessToken
        });
        const {
            id,
            email,
            username: name
        } = profile;
        if (!email) {
            done(null, false, {
                // eslint-disable-next-line max-len
                message: 'Sorry, you can not use discord login with an discord account that does not have email set.',
            });
        }
        const user = await oauthLogin(email, name, id);
        done(null, user);
    } catch (err) {
        done(err);
    }
}));

passport.use(new VKStrategy({
    clientID: auth.vkontakte.id,
    clientSecret: auth.vkontakte.secret,
    callbackURL: '/api/auth/vk/return',
    proxy: true,
    scope: ['email'],
    profileFields: ['displayName', 'email'],
}, async (accessToken, refreshToken, params, profile, done) => {
    try {
        logger.info(profile);
        const {
            displayName: name
        } = profile;
        const {
            email
        } = params;
        const user = await oauthLogin(email, name);
        done(null, user);
    } catch (err) {
        done(err);
    }
}));

module.exports = passport