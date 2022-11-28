const express = require("express");
const {
  createTask,
  browseTask,
  getTask,
  deleteTask,
  updateAssignees,
  updateStatus,
} = require("../controllers/task.controllers");
const router = express.Router();
const { body } = require("express-validator");

/**
 * @route POST api/task
 * @description create a task
 * @access private manager
 * @rule required fields must present
 */
router.post(
  "/",
  [
    body("name").notEmpty().isString(),
    body("description").notEmpty().isString(),
    body("status")
      .not()
      .contains(["pending", "working", "review", "done", "archive"]),
  ],
  createTask
);

/**
 * @route GET api/task/
 * @description browse tasks with filter allowance (name, status, createdAt,…)
 * @access private manager
 */
router.get("/", browseTask);

/**
 * @route GET api/task/:id
 * @description get a task by ID
 * @access private
 */
router.get("/:id", getTask);

/**
 * @route PUT api/task/:id
 * @description assign a task to user or unassign them
 * @access private manager
 */
router.put("/:id", updateAssignees);

/**
 * @route PUT api/task/:id/status
 * @description update task status
 * @access private manager
 * @rule when the status is set to done, it can’t be changed to other value except archive
 */
router.put("/:id/status", updateStatus);

/**
 * @route DELETE api/task/:id
 * @description SOFT delete a task (update isDelete)
 * @access private manager
 */
router.delete("/:id", deleteTask);

module.exports = router;
