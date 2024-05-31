const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/ToDoRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require("./models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Todo = require("./models/ToDoModel.js");

require("dotenv").config();
const secret = "secret123";

const app = express();
const PORT = process.env.port || 5001;

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Update this to match your frontend URL
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected To MongoDb"))
  .catch((err) => console.log(err));

const db = mongoose.connection;
db.on("error", console.log);

app.use(routes);

app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/user", (req, res) => {
  if (!req.cookies.token) {
    return res.json({});
  }
  const payload = jwt.verify(req.cookies.token, secret);
  User.findById(payload.id).then((userInfo) => {
    if (!userInfo) {
      return res.json({});
    }
    res.json({ id: userInfo._id, email: userInfo.email });
  });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ password: hashedPassword, email });
  user.save().then((userInfo) => {
    jwt.sign(
      { id: userInfo._id, email: userInfo.email },
      secret,
      (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res
            .cookie("token", token)
            .json({ id: userInfo._id, email: userInfo.email });
        }
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((userInfo) => {
    if (!userInfo) {
      return res.sendStatus(401);
    }
    const passOk = bcrypt.compareSync(password, userInfo.password);
    if (passOk) {
      jwt.sign({ id: userInfo._id, email }, secret, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res
            .cookie("token", token)
            .json({ id: userInfo._id, email: userInfo.email });
        }
      });
    } else {
      res.sendStatus(401);
    }
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").send();
});

// Uncomment and update these routes if necessary
// app.get("/todos", (req, res) => {
//   const payload = jwt.verify(req.cookies.token, secret);
//   Todo.where({ user: new mongoose.Types.ObjectId(payload.id) }).find(
//     (err, todos) => {
//       res.json(todos);
//     }
//   );
// });

// app.put("/todos", (req, res) => {
//   const payload = jwt.verify(req.cookies.token, secret);
//   const todo = new Todo({
//     text: req.body.text,
//     done: false,
//     user: new mongoose.Types.ObjectId(payload.id),
//   });
//   todo.save().then((todo) => {
//     res.json(todo);
//   });
// });

// app.post("/todos", (req, res) => {
//   const payload = jwt.verify(req.cookies.token, secret);
//   Todo.updateOne(
//     {
//       _id: new mongoose.Types.ObjectId(req.body.id),
//       user: new mongoose.Types.ObjectId(payload.id),
//     },
//     {
//       done: req.body.done,
//     }
//   ).then(() => {
//     res.sendStatus(200);
//   });
// });

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
