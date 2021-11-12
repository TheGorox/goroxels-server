const logger = require('./logger')('PASSPORT', 'debug');

const passport = require('passport');
const User = require('./db/models/User');
const {
    auth
} = require('./config');
const {
    randomNameGenerator
} = require('./utils')

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

passport.deserializeUser(async function (id, done) {
    const user = await User.findOne({
        where: {
            id
        }
    });

    done(null, user || null);
});

async function login(options){
    // TODO check is function protected
    const email = options.email;

    if(!email) throw new Error('No email in login function');
    if(!options.name)
        throw new Error('No name in login function');

    options.name = options.name.slice(0, 32);

    let user = await User.findOne({ where: { email } });
    if(!user){
        let name = options.name;

        while(true){
            const exists = await User.findOne({ where: { name } });
            if(exists){
                name = randomNameGenerator(options.name);
            }else break
        }
        options.name = name;

        logger.debug('Creating account with options ' + JSON.stringify(options));
        user = await User.create(options);
    }

    return user
}

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

if(auth.discord.use){
    passport.use(new DiscordStrategy({
        clientID: auth.discord.id,
        clientSecret: auth.discord.secret,
        callbackURL: '/api/auth/discordCallback'
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
                    message: 'Sorry, you can not use discord login with an discord account that does not have email set.',
                });
            }
    
            // TODO: user already exists check
            
            const user = await login({
                discordId: id.toString(),
                name,
                email
            })
    
            done(null, user);
        } catch (err) {
            done(err);
        }
    }));
}

if(auth.vkontakte.use){
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
}

module.exports = passport