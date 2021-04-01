let refreshTokenModel = function(sequelize, DataTypes){
    return sequelize.define('token',{
        username:{
            type:DataTypes.STRING,
            primaryKey:true
        },
        token: DataTypes.TEXT
    })
}

module.exports = refreshTokenModel;