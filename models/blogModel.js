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
        author : {
            type : DataTypes.STRING
        },
        image : {
            type : DataTypes.STRING
        },
    })
    return Blog
}
module.exports = makeBlogTable