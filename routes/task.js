const express = require("express");
const router = express.Router();
const taskSchema = require("../models/task.js");
const wrapAsync = require("../utils/wrapAsync.js");
const userSchema = require("../models/user.js");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const userId = res.locals.currUser._id;
    const user = await userSchema.findById(userId);
    const userTask = user.tasks;
    const tasks = await taskSchema.find({ _id: { $in: userTask } });
    res.render("index.ejs", { tasks });
  })
);

router.post(
  "/new",
  wrapAsync(async (req, res) => {
    const { task } = req.body;
    const newTask = new taskSchema({ task });
    const userId = res.locals.currUser._id;
    const user = await userSchema.findById(userId);
    user.tasks.push(newTask._id);
    await user.save();
    await newTask.save();
    req.flash("success", "Task Added");
    res.redirect("/task");
  })
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await taskSchema.findByIdAndDelete(id);
    const userId = res.locals.currUser._id;
    await userSchema.findByIdAndUpdate(userId, { $pull: { tasks: id } });
    req.flash("error", "Deleted");
    res.redirect("/task");
  })
);

router.patch(
  "/:id/mark",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const task = await taskSchema.findById(id);
    let state;
    if (task.state == "Incomplete") {
      state = "Complete";
      req.flash("success", "Task Completed");
    } else {
      state = "Incomplete";
      req.flash("error", "Test set to Incomplete");
    }
    await taskSchema.findByIdAndUpdate(id, { state });

    res.redirect("/task");
  })
);

module.exports = router;
