import { Request, Response } from "express";
import { postService } from "./post.service";
import { postStatus } from "../../../generated/prisma/enums";

const createPost = async(req:Request, res:Response) =>{
    try {
        console.log(req.user)
        if(!req.user){
            return res.status(400).json({
                success:false,
            error: "Unauthorized..!",
        })
        }
        const result = await postService.createPost(req.body, req.user.id)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json({
            error: "Post creation failed..!",
            details: error
        })
    }
};

const getPost = async(req:Request, res:Response) =>{
    try {
        const {search} = req.query;
        const searchString = typeof search === 'string' ? search : undefined;
        const tags = req.query.tags ?  (req.query.tags as string).split(",") : [];
        const isFeatured = req.query.isFeatured 
        ? req.query.isFeatured === "true" 
        ? true 
        : req.query.isFeatured === "false" 
        ? false 
        : undefined
        : undefined;

        const status = req.query.status as postStatus | undefined;
        
        const result = await postService.getPost({search:searchString, tags, isFeatured, status});
        res.status(200).json({
            status: 200,
            message: "Post retrive successfully ..!",
            data: result
        })
    } catch (error) {
        res.status(400).json({
            error: "Can't retrive post",
            details: error
        })
    }
}


export const postController = {createPost, getPost};