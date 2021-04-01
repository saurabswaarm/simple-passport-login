const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
    async function authenticateLocal(email, password, done){
        try {
            let user = await getUserByEmail(email);
            if(!user) return done(null, false, {message: 'Email Id Does not exist'})

            let validated = await bcrypt.compare(password, user.password);

            if(validated){
                return done(null, user);
            } else {
                return done(null, false, {message:'Incorrect Password'});
            }

        } catch(err) {
            done(err, false, {message: 'Something went wrong'}); 
        }
    }

    passport.use(new LocalStrategy({usernameField:'email'},authenticateLocal));

    passport.serializeUser(function(user, done){
        console.log('Serialized:' + user.name);
        done(null, user.id);
    })

    passport.deserializeUser(async function(id, done){
        try{
            let user = await getUserById(id)
            console.log('Deserialized:' + user.name);
            done(null, user);
        } catch(err) {
            done(err);
        }
    })
}

module.exports = initialize;