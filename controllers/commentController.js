import commentModel from "../models/commentModel.js";
import userModel from "../models/userModel.js";

export const getPostComments = async (req, res) => {
  const comments = await commentModel
    .find({ post: req.params.postId })
    .populate("user", "username img")
    .sort({ createdAt: -1 });
  res.json(comments);
};
export const addComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId = req.params.postId;
  if (!clerkUserId) {
    return res.status(401).json("Unauthorized to add comment");
  }

  const user = await userModel.findOne({ clerkUserId });

  const newComment = new commentModel({
    ...req.body,
    user: user._id,
    post: postId,
  });
  const savedComment = await newComment.save();

  // setTimeout(() => {
  //   res.status(201).json(savedComment);
  // }, 3000);

  res.status(201).json(savedComment);
};

export const deleteComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const id = req.params.id;
  if (!clerkUserId) {
    return res.status(401).json("Unauthorized to add comment");
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role === "admin") {
    await commentModel.findByIdAndDelete(req.params.id);
    return res.status(200).json("Comment has been deleted successfully");
  }

  const user = await userModel.findOne({ clerkUserId });

  const deletedComment = await commentModel.findOneAndDelete({
    _id: id,
    user: user._id,
  });

  if (!deletedComment) {
    return res.status(403).json("You can delete only your comment!");
  }

  res.status(200).json("Comment deleted successfully!");
};
