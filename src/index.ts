import { config } from "dotenv";
import express  from "express";
import { AuthController } from "./controllers/auth.controller";
import { SessionService, UserService } from "./services/mongoose/services";
import { openConnection } from "./services/mongoose/utils/mongoose-connect.utils";
import { UserRole } from "./models";

config();

async function startServer() {
    const connection = await openConnection();
    const userService = new UserService(connection);
    await bootstrapAPI(userService);
    const sessionService = new SessionService(connection)
    const app = express();
    const authController = new AuthController(userService, sessionService);
    app.use("/auth", authController.buildRouter());

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}

async function bootstrapAPI(userService: UserService) {
    if(typeof process.env.GYMFLOW_ROOT_EMAIL === "undefined"){
        throw new Error('GYMFLOW_ROOT_EMAIL is not defined')
    }

    if(typeof process.env.GYMFLOW_ROOT_PASSWORD === "undefined"){
        throw new Error('GYMFLOW_ROOT_PASSWORD is not defined')
    }

    const rootUser = await userService.findUser(process.env.GYMFLOW_ROOT_EMAIL)

    if(!rootUser) {
        await userService.createUser({
            firstName: 'root',
            lastName: 'root',
            password: process.env.GYMFLOW_ROOT_PASSWORD,
            email: process.env.GYMFLOW_ROOT_EMAIL,
            role: UserRole.SUPER_ADMIN,
            isActive: true
        })
    }
}

startServer().then(() => {
    console.log("API bootstrapped successfully.");
}).catch((error) => {
    console.error("Error bootstrapping API:", error);
    process.exit(1);
});