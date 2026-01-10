import app from "./app";
import { prisma } from "./lib/prisma"

const port = process.env.PORT || 5000;

async function main() {
    try {
        await prisma.$connect();
        console.log("connected databse successfully...!")
        app.listen(port,()=>{
            console.log(`Server is running at ${port}`)
        })
    } catch (error) {
        console.log("An error occurred", error)
        await prisma.$disconnect();
        process.exit(1)
    }
}

main();