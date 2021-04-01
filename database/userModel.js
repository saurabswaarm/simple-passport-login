let userModel = function(sequelize, DataTypes){
    return sequelize.define('user',{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        email:{
            type:DataTypes.STRING,
            unique:'email',
            allowNull:false
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        password:{
            type: DataTypes.STRING,
            allowNull:false
        }
    });
}

module.exports = userModel;