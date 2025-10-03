const logger = require('./logger')('PASSPORT', 'debug');

const passport = require('passport');
const {User} = require('./db/models/User');
const {
    auth
} = require('./config');
const { generateUsername } = require("unique-username-generator");

const {
    Strategy: DiscordStrategy
} = require('passport-discord');
var GoogleStrategy = require('passport-google-oidc');
const {
    Strategy: VKStrategy
} = require('passport-vkontakte');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    const user = await User.findOne({
        where: {
            id
        }
    });

    done(null, user || null);
});

async function login(options) {
    const email = options.email;

    if (!email) throw new Error('No email in login function');
    if (!options.name)
        throw new Error('No name in login function');

    options.name = options.name.slice(0, 32);

    let user = await User.findOne({ where: { email } });
    if (!user) {
        let name = options.name;

        while (true) {
            const exists = await User.findOne({ where: { name } });
            if (exists) {
                name = generateUsername('-');
            } else break
        }
        options.name = name;

        logger.debug('Creating account with options ' + JSON.stringify(options));
        user = await User.create(options);
    }

    return user
}

if (auth.google.use) {
    passport.use(new GoogleStrategy({
        clientID: auth.google.id,
        clientSecret: auth.google.secret,
        callbackURL: '/api/auth/googleCallback'
    },
        async (issuer, profile, done) => {
            const emails = profile.emails;
            if (!emails || !emails.length) {
                return done(null, false, {
                    message: 'You cannot login with google acount without an email!'
                });
            }

            const email = emails[0].value;
            const randomName = generateUsername('-');

            logger.info(`Google auth: ${email}`);

            try {
                const user = await login({
                    name: randomName,
                    email
                });

                done(null, user);
            } catch (err) {
                logger.error(err);
                done('Unexpected server error');
            }
        }
    ));
}

if (auth.discord.use) {
    passport.use(new DiscordStrategy({
        clientID: auth.discord.id,
        clientSecret: auth.discord.secret,
        callbackURL: '/api/auth/discordCallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            logger.info(`Discord auth: ${profile.username}`);
            const {
                id,
                email,
                username: name
            } = profile;
            if (!email) {
                return done(null, false, {
                    message: 'Sorry, you can not use discord login with an discord account that does not have email set.',
                });
            }

            // TODO: user already exists check

            const user = await login({
                discordId: id.toString(),
                name,
                email
            });

            done(null, user);
        } catch (err) {
            logger.error(err);
            done('Unexpected server error');
        }
    }));
}

if (auth.vkontakte.use) {
    passport.use(new VKStrategy({
        clientID: auth.vkontakte.id,
        clientSecret: auth.vkontakte.secret,
        callbackURL: '/api/auth/vk/return',
        proxy: true,
        scope: ['email'],
        profileFields: ['displayName', 'email'],
    }, async (accessToken, refreshToken, params, profile, done) => {
        try {
            logger.info(`VK auth: ${profile.displayName}`);

            const {
                displayName: name,
                id: vkId
            } = profile;
            const {
                email
            } = params;
            const user = await login({
                email, name, vkId
            });
            done(null, user);
        } catch (err) {
            logger.error(err);
            done('Unexpected server error');
        }
    }));
}

module.exports = passport