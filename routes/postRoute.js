import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  deletePost,
  uploadAuth,
  featurePost,
} from "../controllers/postController.js";
import increaseVisit from "../middleWares/increaseVisit.js";

const router = express.Router();

router.get("/upload-auth", uploadAuth); //IT MUCH BE ON TOP TO AVOID CONFLICT DUE TO DYNAMIC SLUG
router.get("/", getPosts);
router.get("/:slug", increaseVisit, getPost);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.patch("/feature", featurePost);

export default router;
