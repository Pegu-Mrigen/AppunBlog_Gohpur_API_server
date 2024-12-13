import userModel from "../models/userModel.js";

export const getUserSavedPosts = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json("Unauthorized to get saved posts");
  }

  const user = await userModel.findOne({ clerkUserId });

  res.status(200).json(user.savedPosts);
};

export const savePost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId = req.body.postId;

  if (!clerkUserId) {
    return res.status(401).json("Unauthorized to save post");
  }

  const user = await userModel.findOne({ clerkUserId });

  const isSaved = user.savedPosts.some((p) => p === postId);

  if (!isSaved) {
    await userModel.findByIdAndUpdate(user._id, {
      $push: { savedPosts: postId },
    });
  } else {
    await userModel.findByIdAndUpdate(user._id, {
      $pull: { savedPosts: postId },
    });
  }

  setTimeout(() => {
    res
      .status(200)
      .json(
        isSaved ? "Post unsaved successfully!" : "Post saved successfully!"
      );
  }, 3000);
};
