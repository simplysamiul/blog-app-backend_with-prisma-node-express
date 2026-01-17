import { Payload, PostWhereInput } from './../../../generated/prisma/internal/prismaNamespace';
import { commentStatus, Post, postStatus } from "../../../generated/prisma/client";
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
        } : { createdAt: "desc" },
        include: {
            _count: {
                select: { comments: true }
            }
        }
    });

    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
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
    return await prisma.$transaction(async (tx) => {
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
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: commentStatus.APPROVED
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        replies: {
                            where: {
                                status: commentStatus.APPROVED
                            },
                            orderBy: { createdAt: "asc" },
                            include: {
                                replies: {
                                    where: {
                                        status: commentStatus.APPROVED
                                    },
                                    orderBy: { createdAt: "asc" }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }

        });
        return result;
    })
}


const getMyPost = async (authorId: string) => {
    const userInfo = await prisma.user.findUnique({
        where: {
            id: authorId,
            status: "ACTIVE"
        },
        select: {
            id: true,
            status: true
        }
    })
    const result = await prisma.post.findMany({
        where: { authorId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { comments: true } } }
    });
    const total = await prisma.post.count({
        where: {
            authorId
        }
    })

    return {
        data: result,
        total
    };
}

const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if (!isAdmin && postData.authorId !== authorId) {
        throw new Error("Your are not the owner/creator of the post!")
    }

    if (!isAdmin) {
        delete data.isFeatured
    }

    const result = await prisma.post.update({
        where: {
            id: postData.id
        },
        data
    })

    return result;
}


const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if (!isAdmin && postData.authorId !== authorId) {
        throw new Error("Your are not the owner/creator of the post!")
    }

    const result = await prisma.post.delete({
        where: {
            id: postData.id
        }
    })

    return result;
};

const getStats = async()=>{
    return await prisma.$transaction(async (tx)=>{
        const totalPost = await tx.post.count();
        const publishedPost = await tx.post.count({
            where: {
                status: postStatus.PUBLISHED
            }
        })

        const draftPost = await tx.post.count({
            where: {
                status: postStatus.DRAFT
            }
        })

        const archivedPost = await tx.post.count({
            where: {
                status: postStatus.ARCHIVED
            }
        })

        return {
            totalPost, publishedPost, draftPost, archivedPost
        }
    })
}


export const postService = {
    createPost,
    getPost,
    getPostById,
    getMyPost,
    updatePost,
    deletePost,
    getStats
}