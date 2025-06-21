const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/db");

const makeContactTable = (sequelize, DataTypes)=>{
    const Contact = sequelize.define("contact", {
        name : {
            type : DataTypes.STRING
        },
        email : {
            type : DataTypes.STRING
        },
        message : {
            type : DataTypes.STRING
        },
    })
    return Contact
}
module.exports = makeContactTable