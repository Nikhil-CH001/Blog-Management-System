const JWT = require("jsonwebtoken");

const isLogInOrNot = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.redirect("/login");
    } else {
        JWT.verify(token, "secretekey", (error, result) => {
            if (error) {
                res.redirect("/login");
            } else {
                req.userId = result.id;
                req.user = result;
                res.locals.user = result;  
                next();
            }
        });
    }
};

module.exports = isLogInOrNot;
