import express from 'express';
import { postController } from './post.controller';
import { auth, UserRole } from '../../middleware/auth';

const router = express.Router();



router.post("/", auth(UserRole.USER), postController.createPost);
router.get("/", postController.getPost);
router.get("/myPosts",auth(UserRole.USER, UserRole.ADMIN), postController.getMyPost);
router.get("/stats",auth(UserRole.ADMIN), postController.getStats);
router.get("/:postId", postController.getPostById);
router.patch("/:postId",auth(UserRole.USER, UserRole.ADMIN), postController.updatePost);
router.delete("/:postId", postController.deletePost);

export const postRouter = router;