import express from "express";
import { addComment, deleteComment, getPostComments } from "../controllers/commentController.js";
const router = express.Router();

// router.get("/test", (req, res) => {
//   res.json("This is a test route.");
// });
router.get("/:postId", getPostComments);
router.post("/:postId", addComment);
router.delete("/:id", deleteComment);

export default router;
