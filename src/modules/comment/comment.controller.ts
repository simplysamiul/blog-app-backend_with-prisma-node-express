import { Request, Response } from "express";
import { commentService } from "./comment.service";

const commentCreate = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.authorId = user?.id;
        const result = await commentService.commentCreate(req.body);
        res.status(200).json({
            status: "Success",
            message: "Comment created successfully ..!",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Comment not created",
            details: error
        })
    }
};

const getCommentById = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id as string;
        const result = await commentService.getCommentById(commentId);
        res.status(200).json({
            status: "Success",
            message: "Comment retrive successfully ..!",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Comment retrive failed",
            details: error
        })
    }
};


const getCommentsByAuthor = async (req: Request, res: Response) => {
    try {
        const authorId = req.params.id as string;
        const result = await commentService.getCommentsByAuthor(authorId);
        res.status(200).json({
            status: "Success",
            message: "Comment retrive successfully ..!",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Comment retrive failed",
            details: error
        })
    }
};


const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id as string;
        const user = req.user;
        const result = await commentService.deleteComment(commentId, user?.id as string);
        res.status(200).json({
            status: "Success",
            message: "Comment deleted successfully ..!",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Comment delete failed",
            details: error
        })
    }
};


const updateComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const commentId = req.params.id;
        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string)
        res.status(200).json({
            success:"true",
            message: "Comment updated succesfully ..!",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Comment delete failed",
            details: error
        })
    }
}




const modarateComment = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const result = await commentService.modarateComment(id as string, req.body);
        res.status(200).json({
            success:"true",
            message: "Comment updated succesfully ..!",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: "false",
            message: "Comment delete failed",
            details: error
        })
    }
}

export const commentController = {
    commentCreate,
    getCommentById,
    getCommentsByAuthor,
    deleteComment,
    updateComment,
    modarateComment,
}