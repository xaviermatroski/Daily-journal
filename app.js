//jshint esversion:6
// let posts = [];
// let allPosts = [];

// Post.find({}).then(function(data){
//   allPosts.push(data);
// });

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "This is a secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const url = process.env.URL;
mongoose.connect(url);

// Post
const postSchema = {
  title: String,
  body: String
};

const Post = mongoose.model("Post", postSchema);

// User
const userSchema = new mongoose.Schema({
  username: String, 
  email: String,
  password: String,
  postList: [postSchema],
  // isLoggedIn: {
  //   type: Boolean,
  //   default: false
  // }
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// const homeStartingContent = "At Daily Journal, we believe that every day holds a story waiting to be told. Whether it’s a fleeting moment of inspiration, a heartfelt reflection, or an exciting adventure, we’re here to capture those narratives and share them with you.";
// const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
// const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

let tempUser = {};

app.get("/", function(req, res){
  Post.find({}).then(function(data){
    res.render("home", {
      title: "Home",
      // startingContent: homeStartingContent,
      posts: data
    });
  });

  // res.render("home", {
  //   title: "Home",
  //   startingContent: homeStartingContent,
  //   posts: allPosts
  // });
});

app.get("/about", function(req, res){
  res.render("about", {
    title: "About",
    // startingContent: aboutContent
  });
});

app.get("/contact", function(req, res){
  res.render("contact", {
    title: "Contact",
    // startingContent: contactContent
  });
});

app.get("/compose", function(req, res){
  if(req.isAuthenticated()){
    res.render("compose", {
      title: "Compose"
    });
  }else{
    res.redirect("/register");
  }
})

app.get("/register", function(req, res){
  res.render("register");
})

app.post("/register", function(req, res){
  console.log(req.body.username);
  // const user = new User({
  //   userName: req.body.username,
  //   email: req.body.email,
  //   password: req.body.password,
  //   postList: [],
  //   isLoggedIn: true,
  // })

  // user.save();

  // res.redirect("/login");

  User.register({
    username: req.body.username, 
    email: req.body.email,
    postList: []
  }, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/login");
      })
    }
  })
})

app.get("/login", function(req, res){
  res.render("login");
})

app.post("/login", function(req, res){
  // if(req.body.button == "login"){
  //   User.find({userName: req.body.username}).then(function(data){
  //     if(data[0] != null){
  //       if(data[0].password == req.body.password){
  //         User.findOneAndUpdate({email: data[0].email}, {isLoggedIn: true});
  //         res.redirect("/" + data[0].userName + "/compose");
  //       }else{
  //         console.log("Wrong password");
  //       }
  //     }else{
  //       console.log("No user found")
  //     }
  //   });
  // }else{
  //   res.redirect("/register");
  // }

  tempUser = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(tempUser, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/compose");
      })
    }
  })
})

// app.get("/:user/compose", function(req, res){
//   User.find({}).then(function(data){
//     if(data[0] != null){
//       for(var i = 0; i<data.length; i++){
//         if(data[i].userName == req.params.user){
//           res.render("compose", {
//             title: "Compose",
//             user: data[i].userName
//           });
//         }else{
//           res.render("noUser");
//         }
//       }
//     }else{
//       res.render("noUser");
//     }
//   });
// });

app.post("/compose", function(req, res){
  User.find({username: tempUser.username}).then(function(data){
    const tempPost = new Post({
      title: req.body.title,
      body: req.body.body
    })

    data[0].postList.push(tempPost);
    data[0].save();

    tempPost.save();

    res.redirect("/");
  });
});

app.get("/posts/:post", function(req, res){
  Post.find({}).then(function(data){
    for(let i = 0; i<data.length; i++){
      if(_.lowerCase(data[i].title) == _.lowerCase(req.params.post)){
        res.render("post", {
          title: data[i].title,
          body: data[i].body
        })
      }
    }
  });
 
  // for(let i = 0; i<allPosts.length; i++){
  //   if(_.lowerCase(allPosts[i].title) == _.lowerCase(req.params.post)){
  //     res.render("post", {
  //       title: posts[i].title,
  //       body: data[i].body
  //     })
  //   }
  // }
});

app.get("/users/:user", function(req, res){
  User.find({username: req.params.user}).then(function(data){
    if(data[0] != null){
      res.render("userPosts", {
        allPosts: data[0].postList,
      });
    }else{
      res.render("noUser")
    }
  });
});



app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});
