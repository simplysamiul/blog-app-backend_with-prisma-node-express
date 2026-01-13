import { Payload, PostWhereInput } from './../../../generated/prisma/internal/prismaNamespace';
import { Post, postStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    });
    return result;
};

const getPost = async ({ search, tags, isFeatured, status, page, limit, skip, sortBy, sortOrder }: { search: string | undefined, tags: string[] | [], isFeatured: boolean | undefined, status: postStatus | undefined, page: number, limit: number, skip: number, sortBy: string | undefined, sortOrder: string | undefined }) => {

    const andConditions: PostWhereInput[] = [];
    if (search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    tags: {
                        has: search as string,
                    }
                }
            ]
        },)
    }

    if (tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: tags as string[]
            }
        },)
    }

    if (typeof isFeatured === "boolean") {
        andConditions.push({
            isFeatured: isFeatured
        })
    }

    if (status) {
        andConditions.push({
            status
        })
    }

    const result = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions
        },
        orderBy: sortBy && sortOrder ? {
            [sortBy]: sortOrder
        } : { createdAt: "desc" }
    });

    const total = await prisma.post.count({
        where: {
            AND: andConditions
        },
    })

    return {
        data: result,
        total,
        page,
        limit
    }
}

const getPostById = async (postId: string) => {

    // update post view count 
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })
        const result = await tx.post.findUnique({
            where: {
                id: postId
            }
        });
    })
    return result;
}

export const postService = {
    createPost,
    getPost,
    getPostById
}