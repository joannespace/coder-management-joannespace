const express = require("express");
const {
  createUser,
  getAllUsers,
  getOneUser,
  getUserTask,
} = require("../controllers/user.controllers");
const router = express.Router();
const { body } = require("express-validator");

/**
 * @route POST api/user
 * @description create a new user
 * @access private manager
 * @rule required fields must present and have duplicated info or not?
 */

router.post(
  "/",
  [body("name").notEmpty().isString(), body("role").notEmpty()],
  createUser
);

/**
 * @route GET api/user
 * @description get all users with filter / search by name
 * @access public
 */
router.get("/", getAllUsers);

/**
 * @route GET api/user/:id
 * @description get one user
 * @access public
 */

router.get("/:id", getOneUser);

/**
 * @route GET api/user/:id/tasks
 * @description get all tasks of a user
 * @access private manager
 */
router.get("/:id/tasks", getUserTask);

module.exports = router;
