import { Request, Response, Router, json } from "express";
import { sessionMiddleware } from "../middlewares";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { Equipment, UserRole } from "../models";
import { ExerciseService, GymService, SessionService, UserService } from "../services/mongoose/services";

export class ExerciseController {
    private readonly exerciseService: ExerciseService;
    private readonly gymService: GymService;
    private readonly sessionService: SessionService;
    private readonly userService: UserService;

    constructor(exerciseService: ExerciseService, gymService: GymService, sessionService: SessionService, userService: UserService) {
        this.exerciseService = exerciseService;
        this.gymService = gymService;
        this.sessionService = sessionService;
        this.userService = userService;
    }


    async getAll(req: Request, res: Response) {
        const isAdmin = req.user && req.user.role === UserRole.SUPER_ADMIN;
        const exercises = await this.exerciseService.findAll(isAdmin);
        res.json(exercises);
    }


    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const isAdmin = req.user && req.user.role === UserRole.SUPER_ADMIN;
        const exercise = await this.exerciseService.findById(id, isAdmin);
        if (!exercise) return res.status(404).json({ _error: "Not found" });
        res.json(exercise);
    }

    async getEquipmentsForExercise(req: Request, res: Response) {
        const { id } = req.params;
        const exercise = await this.exerciseService.findById(id);
        if (!exercise) return res.status(404).json({ _error: "Not found" });
        if (!exercise.equipments || exercise.equipments.length === 0) {
            return res.json({ equipments: [] });
        }

        const equipments = await this.gymService.findEquipmentsByIds(exercise.equipments);
        const equipmentNames = equipments.map((eq: Equipment) => eq.name);
        res.json({ equipments: equipmentNames });
    }

    async create(req: Request, res: Response) {
        if (!req.body || !req.body.name) {
            return res.status(400).json({ _error: "Invalid data" });
        }

        if (req.body.equipments && !Array.isArray(req.body.equipments)) {
            return res.status(400).json({ _error: "Equipments must be an array" });
        }

        try {
            const exercise = await this.exerciseService.create(req.body);
            res.status(201).json(exercise);
        } catch (e) {
            console.error(e);
            res.status(400).json({ _error: "Invalid data or duplicate name" });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const exercise = await this.exerciseService.update(id, req.body);
            if (!exercise) return res.status(404).json({ _error: "Not found" });
            res.json(exercise);
        } catch (e) {
            console.error(e);
            res.status(400).json({ _error: "Invalid data" });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const ok = await this.exerciseService.delete(id);
        if (!ok) return res.status(404).json({ _error: "Not found" });
        res.json({ message: "Deleted" });
    }

    async getForGym(req: Request, res: Response) {
        const { gymId } = req.params;
        const gym = await this.gymService.findGymById(gymId);
        if (!gym || !gym.equipments) return res.status(404).json({ _error: "Gym not found or no equipments" });
        const allExercises = await this.exerciseService.findAll();
        const gymEquipments = gym.equipments.map(String);
        const available = allExercises.filter(exo =>
            !exo.equipments || exo.equipments.length === 0 ||
            exo.equipments.every(eq => gymEquipments.includes(String(eq)))
        );
        res.json(available);
    }

    buildRouter(): Router {
        const router = Router();
        router.use(sessionMiddleware(this.sessionService, this.userService));
        router.get("/", this.getAll.bind(this));
        router.get("/:id", this.getById.bind(this));
        router.get("/for-gym/:gymId", this.getForGym.bind(this));
        router.post("/", json(), requireRoleLevel(3), this.create.bind(this));
        router.put("/:id", json(), requireRoleLevel(3), this.update.bind(this));
        router.delete("/:id", requireRoleLevel(3), this.delete.bind(this));
        router.get("/:id/equipments", this.getEquipmentsForExercise.bind(this));
        return router;
    }
}
