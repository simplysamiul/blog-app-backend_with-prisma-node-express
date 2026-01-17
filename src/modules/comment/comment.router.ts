import express from 'express';
import { commentController } from './comment.controller';
import { auth, UserRole } from '../../middleware/auth';


const router = express.Router();

router.post("/", auth(UserRole.ADMIN, UserRole.USER), commentController.commentCreate);
router.get("/:id",auth(UserRole.ADMIN, UserRole.USER), commentController.getCommentById);
router.get("/author/:id",auth(UserRole.ADMIN, UserRole.USER), commentController.getCommentsByAuthor);
router.delete("/:id", auth(UserRole.ADMIN, UserRole.USER), commentController.deleteComment);
router.put("/:id", auth(UserRole.ADMIN, UserRole.USER), commentController.updateComment);
router.patch("/:id/modarate", auth(UserRole.ADMIN), commentController.modarateComment);


export const commentRouter = router;