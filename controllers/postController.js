import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import imageKit from "imageKit";

export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  // const query = req.query;     ALL THE POST WILL APPEAR IF IN PARAMS "RANDOM=TRUE"
  const query = {};

  const cat = req.query.cat;
  const author = req.query.author;
  const searchQuery = req.query.search;
  const sortQuery = req.query.sort;
  const featured = req.query.featured;

  if (cat) {
    query.category = cat;
  }
  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" }; // VERY
  }
  if (author) {
    const user = await userModel.findOne({ username: author }).select("_id"); //TO AVOID ALL DATA
    if (!user) {
      return res.status(404).json("Post not Found");
    }

    query.user = user._id;
  }
  // if (sortQuery) {
  //   switch (sortQuery) {
  //     case "oldest":
  //       query.createdAt = -1;
  //       break;
  //     case "newest":
  //       query.createdAt = 1;
  //       break;
  //     case "popular":
  //       query.likes = -1;
  //       break;
  //     default:
  //       query.trending = -1;
  //       break;
  //   }
  // }

  let sortObj = { createdAt: -1 };

  if (sortQuery) {
    switch (sortQuery) {
      case "newest":
        sortObj = { createdAt: -1 };

        break;
      case "oldest":
        sortObj = { createdAt: 1 };

        break;
      case "popular":
        sortObj = { visit: -1 };

        break;
      case "trending":
        sortObj = { visit: -1 };
        query.createdAt = {
          $gte: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
        };

        break;
      default:
        break;
    }
  }

  if (featured) {
    query.isFeatured = true;
  }

  const posts = await postModel
    .find(query)
    .populate("user", "username")
    .sort(sortObj)
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPosts = await postModel.countDocuments();

  const hasMore = page * limit < totalPosts;

  res.status(200).json({ posts, hasMore });
};
export const getPost = async (req, res) => {
  const post = await postModel
    .findOne({ slug: req.params.slug })
    .populate("user", "username img");

  res.status(200).json(post);
};
export const createPost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  //console.log(req.headers);
  if (!clerkUserId) {
    return res.status(401).json("Unauthorized to create post");
  }

  const user = await userModel.findOne({ clerkUserId });
  if (!user) {
    return res.status(404).json("User not Found");
  }

  let slug = req.body.title.replace(/ /g, "-").toLowerCase();

  let existingPost = await postModel.findOne({ slug });

  let counter = 2;
  while (existingPost) {
    slug = `${slug}-${counter}`;

    existingPost = await postModel.findOne({ slug });
    counter++;
  }

  const newPost = new postModel({ user: user._id, slug, ...req.body });
  const post = await newPost.save();

  //res.status(200).json("New post has been created successfully");
  res.status(200).json(post);
};
export const deletePost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  console.log(req.headers);
  if (!clerkUserId) {
    return res.status(401).json("Unauthorized to create post");
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role === "admin") {
    await postModel.findByIdAndDelete(req.params.id);
    return res.status(200).json("Post has been deleted successfully");
  }
  const user = await userModel.findOne({ clerkUserId });
  const deletedPost = await postModel.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });

  if (!deletedPost) {
    return res.status(404).json("You can delete only your Post"); // or return res.status(403).json("Unauthorized to delete post") for more strict control.  // or return res.status(401).json("Unauthorized to delete post") for a generalized response.  // or return res.status(403).json("Unauthorized to delete post") for a more strict control.  // or return res.status(401).json("Unauthorized to delete post") for a generalized response.  // or return res.status(403).json("Unauthorized to delete post") for a more strict control.  // or return res.status(401).json("Unauthorized to delete post") for a generalized response.  // or return res.status(403).json("Unauthorized to delete post") for a more strict control.  // or return res
  }

  res.status(200).json("Post has been deleted successfully");
  //res.status(200).json(post);
};
export const featurePost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  const postId = req.body.postId;

  console.log(req.headers);
  if (!clerkUserId) {
    return res.status(401).json("Unauthorized to create post");
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role !== "admin") {
    return res.status(200).json("You can not feature post");
  }

  const post = await postModel.findById(postId);

  if (!post) {
    return res.status(404).json("Post not found");
  }

  const isFeatured = post.isFeatured;

  const updatedPost = await postModel.findByIdAndUpdate(
    postId,
    {
      isFeatured: !isFeatured,
    },
    { new: true }
  );

  res.status(200).json(updatedPost);
};

const imagekit = new imageKit({
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export const uploadAuth = async (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
};
