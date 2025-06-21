const express = require("express")
const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")
const { db } = require("./database/db")

const app = express()
const multer = require("multer")
const path = require('path');
app.use('/uploads', express.static('uploads'));

const isLogInOrNot = require("./middleware/isLogInOrNot")



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
      const token = JWT.sign({ id: user[0].id, username: user[0].username }, "secretekey", { expiresIn: "1d" })
      res.cookie("token", token)
      res.redirect("/")
    } else {
      res.send("Invalids credentials")
    }
  }
})

// home page
app.get("/", isLogInOrNot, async (req, res) => {
   const userId = req.userId
   const blogs = await db.blogs.findAll({
        where : {
            userId : userId
        }
    })
  res.render("page/home", { user: res.locals.user, blogs : blogs})
})

// blog page
app.get("/blog", isLogInOrNot, async (req, res) => {
   const userId = req.userId
   const blogs = await db.blogs.findAll({
        where : {
            userId : userId
        }
    })
  res.render("page/blog", { user: res.locals.user, blogs : blogs})
})

//CRUD operation

//creat uploads folder
const fs = require("fs");
const { where } = require("sequelize")
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//configure multer
const storage = multer.diskStorage({
  destination : "./uploads",
  filename : (req,file,cb)=>{
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

//upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size (e.g., 5MB)
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

   if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only (jpeg, jpg, png, gif)!');
     }
  }
});

//addBlog page
app.get("/addBlog", (req,res)=>{
  res.render("page/CRUD/addBlog", {user: res.locals.user})
})

//addBlog page receive
app.post("/addBlog",isLogInOrNot,upload.single("image"), async(req,res)=>{
  const userId = req.userId
  const username = req.username
  const {title, category, content, tags, author} = req.body
  const image = req.file ? `/uploads/${req.file.filename}` : ""

    await db.blogs.create({
      title : title,
      category : category,
      content : content,
      image : image,
      author : username,
      userId :userId
    })

    res.redirect("/")
})

//edit page
app.get("/editBlog/:id", isLogInOrNot, async(req,res)=>{
  const id = req.params.id
  const blog = await db.blogs.findOne({
    where : {
      id : id
    }
  })
  res.render("page/CRUD/editBlog", {blog : blog})
})

//edit page receive data
app.post("/editBlog/:id", isLogInOrNot,upload.single("image"), async(req,res)=>{
   const id = req.params.id
  const username = req.username
  const {title, category, content, tags, author} = req.body

const oldBlog = await db.blogs.findOne({ where: { id } });
const image = req.file ? `/uploads/${req.file.filename}` : oldBlog.image;

    await db.blogs.update({
      title : title,
      category : category,
      content : content,
      image : image,
      author : username,
    }, {
      where : {
        id : id
      }
    })

    res.redirect("/")
})

//singleBlog page
app.get("/blog/:id", isLogInOrNot, async (req, res) => {
  const id = req.params.id;
  const blog = await db.blogs.findOne({ where: { id } });
  const user = req.user || { name: req.username }; // adjust as needed

  if (!blog) return res.status(404).send("Blog not found");

  res.render("page/CRUD/singleBlog", { blog, user });
});



//deleteBlog
app.post("/deleteBlog/:id", isLogInOrNot, async (req, res) => {
  const id = req.params.id;
  const username = req.username;

  const blog = await db.blogs.findOne({ where: { id } });
  if (!blog || blog.author !== username) {
    return res.status(403).send("Unauthorized to delete this blog.");
  }

  await db.blogs.destroy({ where: { id } });
  res.redirect("/");
});


// logout page
app.get("/logout", (req, res) => {
  res.clearCookie("token")
  res.redirect("/login")
})

app.listen(4444, () => {
  console.log("Server is running on http://localhost:4444")
})
