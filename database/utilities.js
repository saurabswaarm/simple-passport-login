class DatabaseUtilities {
    constructor(db) {
        this.db = db;
        this.getUserByEmail = this.getUserByEmail.bind(this);
        this.getUserById = this.getUserById.bind(this);
    }

    async getUserByEmail(email){
        try{
            let user = await this.db.User.findOne({
                where:{
                    email:email
                }
            });
            return user.toJSON();
        } catch(err){
            return false;
        }
    }

    async getUserById(id){
        try{
            let user = await this.db.User.findOne({
                where:{
                    id:id
                }
            });
            return user.toJSON();
        } catch(err){
            return false;
        }
    }

    async createUser(user){
        try{
            let userModel = await this.db.User.create(user);
            userModel = userModel.toJSON();
            return userModel;
        } catch(err){
            throw new Error(`Couldn't create User`);
        }
    }
}

module.exports = DatabaseUtilities;