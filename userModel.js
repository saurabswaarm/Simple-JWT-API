let userModel =  function(sequelize, DataTypes){
    return sequelize.define('users',{
        name: {
            type:DataTypes.STRING,
            unique:'name',
        },
        password: DataTypes.TEXT,
    })
} 

module.exports = userModel;


