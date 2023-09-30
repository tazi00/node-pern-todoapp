import { Request, Response } from "express";
import pool from "../db/db";

async function getTodo(req: Request, res: Response) {
  try {
    const userId = req.user?.userId; // Get the user ID from the authenticated user
    const result = await pool.query("SELECT * FROM todos WHERE user_id = $1", [
      userId,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching todos", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getTodoById(req: Request, res: Response) {
  const todoId = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [
      todoId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching todo by ID", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addTodo(req: Request, res: Response) {
  const { title, description, type } = req.body;
  const userId = req.user?.userId;
  try {
    const newTodo = await pool.query(
      "INSERT INTO todos (title, description,type, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, type, userId]
    );

    res.status(201).json(newTodo.rows[0]);
  } catch (error) {
    console.error("Error creating todo", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateTodo(req: Request, res: Response) {
  const todoId = req.params.id;
  const { title, description, type } = req.body;

  try {
    const result = await pool.query(
      "UPDATE todos SET title = $1, description = $2, type = $3 WHERE id = $4 RETURNING *",
      [title, description, type, todoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating todo", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteTodo(req: Request, res: Response) {
  const todoId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [todoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function partialUpdateTodo(req: Request, res: Response) {
  const todoId = req.params.id;
  const { title, description, type, isCompleted } = req.body;

  const setClause = [];
  const values = [];

  if (title !== undefined) {
    setClause.push(`title = $${values.length + 1}`);
    values.push(title);
  }

  if (description !== undefined) {
    setClause.push(`description = $${values.length + 1}`);
    values.push(description);
  }

  if (type !== undefined) {
    setClause.push(`type = $${values.length + 1}`);
    values.push(type);
  }

  if (isCompleted !== undefined) {
    setClause.push(`iscompleted = $${values.length + 1}`);
    values.push(isCompleted);
  }

  try {
    // Construct the SQL query with the dynamic SET clause
    const query = `UPDATE todos SET ${setClause.join(", ")} WHERE id = $${
      values.length + 1
    } RETURNING *`;
    values.push(todoId);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating todo", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getFilteredTodos(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { isCompleted, type } = req.query;

    const queryParams = [];
    let query = "SELECT * FROM todos WHERE user_id = $1";

    queryParams.push(userId);

    if (isCompleted !== undefined) {
      query += " AND iscompleted = $2";
      queryParams.push(isCompleted === "true"); // Convert string to boolean
    }

    if (type) {
      query += " AND type = $3";
      queryParams.push(type);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching filtered todos", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
// async function getSortedTodos(req: Request, res: Response) {
//   try {
//     const userId = req.user?.userId;
//     const { sortBy, sortOrder } = req.query;

//     const allowedSortColumns = ["createdat", "title"];
//     const defaultSortColumn = "createdat";

//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ error: "Invalid sortBy parameter" });
//     }

//     const query = `
//       SELECT * FROM todos WHERE user_id = $1
//       ORDER BY ${pool.escapeId(sortBy)} ${sortOrder === "desc" ? "DESC" : "ASC"}
//     `;

//     const result = await pool.query(query, [userId]);
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error fetching sorted todos", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

export {
  addTodo,
  getTodoById,
  getTodo,
  updateTodo,
  deleteTodo,
  getFilteredTodos,
  partialUpdateTodo,
};
