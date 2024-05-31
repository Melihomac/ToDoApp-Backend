// routes/ToDoRoute.js
const express = require("express");
const router = express.Router();
const ToDo = require("../models/ToDoModel");
const jwt = require("jsonwebtoken");
const secret = "secret123";

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.get("/todos", verifyToken, (req, res) => {
  ToDo.find({ user: req.user.id }).then((todos) => {
    res.json(todos);
  });
});

router.post("/todos", verifyToken, (req, res) => {
  const newToDo = new ToDo({
    text: req.body.text,
    user: req.user.id,
    photo: req.body.photo,
  });
  newToDo.save().then((todo) => {
    res.json(todo);
  });
});

router.put("/todos/:id", verifyToken, (req, res) => {
  ToDo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { text: req.body.text, done: req.body.done },
    { photo: req.params.photo },
    { new: true }
  ).then((todo) => {
    res.json(todo);
  });
});

router.delete("/todos/:id", verifyToken, (req, res) => {
  ToDo.findOneAndDelete({ _id: req.params.id, user: req.user.id }).then(() => {
    res.sendStatus(200);
  });
});

module.exports = router;
