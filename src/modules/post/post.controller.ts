import { NextFunction, Request, Response } from "express";
import { postService } from "./post.service";
import { postStatus } from "../../../generated/prisma/enums";
import pagiantionSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/auth";

const createPost = async (req: Request, res: Response, next:NextFunction) => {
    try {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                error: "Unauthorized..!",
            })
        }
        const result = await postService.createPost(req.body, req.user.id)
        res.status(201).json(result)
    } catch (error) {
        next(error);
    }
};

const getPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const searchString = typeof search === 'string' ? search : undefined;
        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === "true"
                ? true
                : req.query.isFeatured === "false"
                    ? false
                    : undefined
            : undefined;

        const status = req.query.status as postStatus | undefined;


        const { page, limit, skip, sortBy, sortOrder } = pagiantionSortingHelper(req.query);

        const result = await postService.getPost({ search: searchString, tags, isFeatured, status, page, limit, skip, sortBy, sortOrder });
        res.status(200).json({
            status: 200,
            message: "Post retrive successfully ..!",
            pagination: result.total,
            page,
            limit,
            data: result.data
        })
    } catch (error) {
        res.status(400).json({
            error: "Can't retrive post",
            details: error
        })
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId as string;
        const result = await postService.getPostById(postId);
        if (!postId) {
            throw new Error("Post Id is required!")
        }
        res.status(200).json({
            status: "Success",
            message: "Data retrive successfully ..!",
            data: result
        })
    } catch (error) {
        res.status(400).json({
            error: "Can't retrive post",
            details: error
        })
    }
}

const getMyPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if(!user){
            throw new Error("You are unauthorized !")
        }
        const result = await postService.getMyPost(user.id);
        res.status(200).json({
            status: "Success",
            message: "Data retrive successfully ..!",
            data: result.data
        })
        
    } catch (error) {
        res.status(400).json({
            success: "False",
            error: "Can't load user data",
            details: error
        })
    }
}


const updatePost = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const user = req.user;
        const {postId}  =req.params;
        if(!user){
            throw new Error("You are unauthorized !")
        }
        const isAdmin = user.role === UserRole.ADMIN
        const result = await postService.updatePost(postId as string, req.body, user.id, isAdmin);
        res.status(200).json({
            status: "Success",
            message: "Data updated successfully ..!",
            data: result
        })
        
    } catch (error) {
        next(error);
    }
}


const deletePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const {postId}  =req.params;
        if(!user){
            throw new Error("You are unauthorized !")
        }
        const isAdmin = user.role === UserRole.ADMIN
        const result = await postService.deletePost(postId as string, user.id, isAdmin);
        res.status(200).json({
            status: "Success",
            message: "Data deleted successfully ..!",
            data: result
        })
        
    } catch (error) {
        res.status(400).json({
            success: "False",
            error: "post deletation failed",
            details: error
        })
    }
}
const getStats = async (req: Request, res: Response) => {
    try {
        const result = await postService.getStats();
        res.status(200).json({
            status: "Success",
            message: "Data deleted successfully ..!",
            data: result
        })
        
    } catch (error) {
        res.status(400).json({
            success: "False",
            error: "post deletation failed",
            details: error
        })
    }
}



export const postController = { createPost, getPost, getPostById, getMyPost, updatePost, deletePost, getStats };