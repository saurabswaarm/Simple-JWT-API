const {Sequelize, DataTypes} = require('sequelize');
const userModel = require('./userModel');
const tokenModel = require('./tokenModel');

const sequelize = new Sequelize('passport', 'root', 'tSGOhY7bZIB5GzW2', {
    host:'127.0.0.1',
    port: '8889',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true
    },
    operatorsAliases: false
})


const initDb = function(){
    let db = {};
    db.User =  userModel(sequelize, DataTypes);

    sequelize.sync({
        alter:true
    });

    return db;
}

let db = initDb();

module.exports = {
    sequelize,
    DataTypes,
    db
}