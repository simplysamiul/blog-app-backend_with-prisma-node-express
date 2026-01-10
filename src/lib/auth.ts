import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
                const info = await transporter.sendMail({
                    from: '"Blog Application backend" <nafis@gmail.com>',
                    to: user.email,
                    subject: "Verify your email address",
                    text: "Hello world?", // Plain-text version of the message
                    html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <title>Email Verification</title>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f5;
                        margin: 0;
                        padding: 0;
                        color: #111827;
                        items: center;
                        }
                        .container {
                        width: 100%;
                        padding: 40px 0;
                        display: flex;
                        justify-content: center;
                        }
                        .email-box {
                        width: 600px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .header {
                        background-color: #2563eb;
                        padding: 20px;
                        text-align: center;
                        color: white;
                        }
                        .header h1 {
                        margin: 0;
                        font-size: 24px;
                        }
                        .content {
                        padding: 30px;
                        }
                        .content h2 {
                        margin-top: 0;
                        font-size: 20px;
                        }
                        .content p {
                        line-height: 1.6;
                        font-size: 15px;
                        }
                        .button {
                        display: inline-block;
                        padding: 14px 24px;
                        margin: 20px 0;
                        background-color: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        }
                        .footer {
                        background-color: #f9fafb;
                        padding: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #6b7280;
                        }
                        .link {
                        word-break: break-all;
                        color: #2563eb;
                        font-size: 13px;
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="email-box">
                        
                        <!-- Header -->
                        <div class="header">
                            <h1>Blog Application</h1>
                        </div>

                        <!-- Body -->
                        <div class="content">
                            <h2>Verify your email address</h2>
                            <p>${user.name}, Welcome to <strong>Blog Application</strong>! Please click the button below to verify your email address and activate your account.</p>
                            <div style="text-align:center;">
                            <a href="${verificationUrl}" class="button">Verify Email</a>
                            </div>
                            <p>If the button doesn’t work, copy and paste this link into your browser:</p>
                            <p class="link">${verificationUrl}</p>
                            <p>This link will expire soon. If you did not create an account, you can safely ignore this email.</p>
                        </div>

                        <!-- Footer -->
                        <div class="footer">
                            © 2026 Blog Application. All rights reserved.
                        </div>

                        </div>
                    </div>
                    </body>
                    </html>
                    `
                });
            } catch (error) {
                console.error(error)
                throw error;
            }
        },
    },

    socialProviders: {
        google: {
            prompt: "select_account consent",
            accessType:"offline",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});