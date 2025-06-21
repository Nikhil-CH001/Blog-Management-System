const express = require("express")
const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")
const { db } = require("./database/db")

const isLogInOrNot = require("./middleware/isLogInOrNot")

const app = express()

const cookieParser = require("cookie-parser")
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")

// register page
app.get("/register", (req, res) => {
  res.render("authentication/register", { user: null })
})

// register page receive data
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body
  const existingUser = await db.users.findOne({ where: { email } })
  if (existingUser) {
    return res.send("Email already registered")
  }
  await db.users.create({
    username: username,
    email: email,
    password: bcrypt.hashSync(password, 10),
  })
  res.redirect("/")
})

// login page
app.get("/login", (req, res) => {
  res.render("authentication/login", { user: null })
})

// login page receive data
app.post("/login", async (req, res) => {
  const { email, password } = req.body
  const user = await db.users.findAll({
    where: {
      email: email,
    },
  })
  if (user.length == 0) {
    res.send("Email not registered")
  } else {
    const isPasswordMatch = bcrypt.compareSync(password, user[0].password)
    if (isPasswordMatch) {
      const token = JWT.sign({ id: user[0].id }, "secretekey", { expiresIn: "1d" })
      res.cookie("token", token)
      res.redirect("/")
    } else {
      res.send("Invalids credentials")
    }
  }
})

// home page
app.get("/", isLogInOrNot, async (req, res) => {
  res.render("page/home", { user: res.locals.user })
})

// blog page
app.get("/blog", isLogInOrNot, (req, res) => {
  res.render("page/blog", { user: res.locals.user })
})

//CRUD operation
//addBlog page
app.get("/addBlog", (req,res)=>{
  res.render("page/CRUD/addBlog", {user: res.locals.user})
})

// logout page
app.get("/logout", (req, res) => {
  res.clearCookie("token")
  res.redirect("/login")
})

app.listen(4444, () => {
  console.log("Server is running on http://localhost:4444")
})
