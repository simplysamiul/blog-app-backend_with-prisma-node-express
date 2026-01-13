import { prisma } from "../lib/prisma"
import { UserRole } from "../middleware/auth";

async function seedAdmin(){
    try {
        console.log("******** Admin seeding start *********")
        const adminData = {
            name:"admin1",
            email: "admin1@admin.com",
            role: UserRole.USER,
            password: "admin1234"
        };
        console.log("******** Checking admin exists or not *********")
        // check user exist on bd or not 
        const existingUser = await prisma.user.findUnique({
            where:{
                email: adminData.email
            }
        });

        if(existingUser){
            throw new Error("User already exists ...!")
        }

        const signUpAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email", {
            method: "POST",
            headers: {"content-Type": "application/json"},
            body: JSON.stringify(adminData)
        })
        
        if(signUpAdmin.ok){
            console.log("******** Admin created *********")
            await prisma.user.update({
                where:{
                    email: adminData.email,
                },
                data: {
                    emailVerified:true
                }
            })
            console.log("******** Email verification status updated *********")
        }
console.log("******** Success *********")

    } catch (error) {
        console.log(error)
    }
}

seedAdmin()