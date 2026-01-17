import { commentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

type CommentPayload = {
    content: string,
    authorId: string,
    postId: string,
    parentId?: string
};

const commentCreate = async (payload: CommentPayload) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    });

    if (payload.parentId) {
        const comment = prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }
    const result = await prisma.comment.create({
        data: payload
    });

    return result;
};

const getCommentById = async (commentId: string) => {
    const result = await prisma.comment.findUnique({
        where: {
            id: commentId
        },
        include: {
            post: true
        }
    })
    return result;
};

const getCommentsByAuthor = async (authorId: string) => {
    const result = await prisma.comment.findMany({
        where: {
            authorId
        },
        orderBy: { createdAt: "desc" },
        include: {
            post: true
        }
    })
    return result;
};


const deleteComment = async (commentId: string, userId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: userId
        },
        select: {
            id: true
        }
    })

    if (!commentData) {
        throw new Error("Your provided input is invalid")
    }

    return await prisma.comment.delete({
        where: {
            id: commentData.id
        }
    })
};


const updateComment = async (commentId: string, data: { content: string, status: commentStatus }, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: authorId
        },
        select: {
            id: true
        }
    })

    if (!commentData) {
        throw new Error("Your provided input is invalid")
    }
    
    await prisma.comment.update({
        where: {
            id:commentId,
            authorId
        },
        data
    })
}


const modarateComment = async(commentId:string, data:{status:commentStatus}) =>{
    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id:commentId
        }
    });

    if(commentData.status === data.status){
        throw new  Error (`Your provided status (${data.status}) is already up to date.`)
    }

    return await prisma.comment.update({
        where: {
            id:commentId
        },
        data
    })
}


export const commentService = {
    commentCreate,
    getCommentById,
    getCommentsByAuthor,
    deleteComment,
    updateComment,
    modarateComment,
}