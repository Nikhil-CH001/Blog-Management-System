require("dotenv").config()

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
    host : process.env.db_host,
    username : process.env.db_username,
    password : process.env.db_password,
    port : process.env.db_port,
    database : process.env.db_name,
    dialect : "mysql"
})

const db = {}
db.users = require("../models/userModel")(sequelize,DataTypes)
db.blogs = require("../models/blogModel")(sequelize,DataTypes)
db.contacts = require("../models/contactModel")(sequelize,DataTypes)

db.users.hasMany(db.blogs)
db.blogs.belongsTo(db.users)

sequelize.authenticate()
    .then(()=>{
        console.log("Database connected successfully")
    })
    .catch(()=>{
        console.log("Failed to connect with database")
    })

sequelize.sync({alter : true})
    .then(()=>{
        console.log("Tables are created")
    })


// module.exports = sequelize
module.exports = {sequelize,db}