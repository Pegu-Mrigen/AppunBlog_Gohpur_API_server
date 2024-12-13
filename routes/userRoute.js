import express from "express";
import { getUserSavedPosts, savePost } from "../controllers/userController.js";
const router = express.Router();

// router.get("/test", (req, res) => {
//   res.json("This is a test route.");
// });

router.get("/saved", getUserSavedPosts);
router.patch("/save", savePost);

export default router;
