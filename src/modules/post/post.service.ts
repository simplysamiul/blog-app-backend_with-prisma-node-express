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

const getPost = async ({ search, tags, isFeatured, status }: { search: string | undefined, tags: string[] | [], isFeatured:boolean | undefined, status:postStatus | undefined}) => {

    const andConditions:PostWhereInput[] = [];
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

    if(typeof isFeatured === "boolean"){
        andConditions.push({
            isFeatured:isFeatured
        })
    }

    if(status){
        andConditions.push({
            status
        })
    }

    const result = await prisma.post.findMany({
        where: {
            AND: andConditions
        }
    });

    return result
}

export const postService = {
    createPost,
    getPost
}