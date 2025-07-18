import { config } from "dotenv";
import express  from "express";
config();

async function startServer() {
    await bootstrapAPI();
    const app = express();

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}

async function bootstrapAPI() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("API has been bootstrapped.");
            resolve(true);
        }, 1000);
    });
}

startServer().then(() => {
    console.log("API bootstrapped successfully.");
}).catch((error) => {
    console.error("Error bootstrapping API:", error);
    process.exit(1);
});