import express from "express";
import {
  addTodo,
  deleteTodo,
  getFilteredTodos,
  getTodo,
  getTodoById,
  partialUpdateTodo,
  updateTodo,
} from "../controllers/todo.controller";
const todoRouter = express.Router();

todoRouter.route("/").post(addTodo).get(getTodo);
todoRouter.route("/:id").put(updateTodo).delete(deleteTodo).get(getTodoById);
todoRouter.route("/:id").patch(partialUpdateTodo);
todoRouter.route("/filter").get(getFilteredTodos);
// todoRouter.route("/sort").get(sortTodos);
export default todoRouter;
