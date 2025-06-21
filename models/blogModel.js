const makeBlogTable = (sequelize, DataTypes)=>{
    const Blog = sequelize.define("blog", {
        title : {
            type : DataTypes.STRING
        },
        category : {
            type : DataTypes.STRING
        },
        content : {
            type : DataTypes.STRING
        },
        date : {
            type : DataTypes.STRING
        },
    })
    return Blog
}
module.exports = makeBlogTable