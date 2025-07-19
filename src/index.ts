import { config } from "dotenv";
import express  from "express";
import { AuthController } from "./controllers/auth.controller";
import { EquipmentController } from "./controllers/equipment.controller";
import { ExerciseController } from "./controllers/exercise.controller";
import { GymController } from "./controllers/gym.controller";
import { UserRole } from "./models";
import { EquipmentService , SessionService, UserService, GymService, ExerciseService } from "./services/mongoose/services";
import { openConnection } from "./services/mongoose/utils/mongoose-connect.utils";

config();

async function startServer() {
    const connection = await openConnection();
    const userService = new UserService(connection);
    const sessionService = new SessionService(connection);
    const exerciseService = new ExerciseService(connection);
    const gymService = new GymService(connection);
    const equipmentService = new EquipmentService(connection);
    
    await bootstrapAPI(userService);
    
    const app = express();
    const authController = new AuthController(userService, sessionService);
    const gymController = new GymController(gymService, sessionService, userService);
    const exerciseController = new ExerciseController(exerciseService, gymService, sessionService, userService);
    const equipmentController = new EquipmentController(equipmentService, sessionService, userService);
    
    app.use("/auth", authController.buildRouter());
    app.use("/gyms", gymController.buildRouter());    
    app.use("/exercises", exerciseController.buildRouter());
    app.use("/equipments", equipmentController.buildRouter());
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
}).catch((_error) => {
    console.error("Error bootstrapping API:", _error);
    process.exit(1);
});