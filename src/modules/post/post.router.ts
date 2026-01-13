import express, { NextFunction, Request, Response } from 'express';
import { postController } from './post.controller';
import { auth, UserRole } from '../../middleware/auth';

const router = express.Router();



router.post("/", auth(UserRole.USER), postController.createPost);
router.get("/", postController.getPost);
router.get("/:postId", postController.getPostById)

export const postRouter = router;