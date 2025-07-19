import { Request, Response, Router, json } from "express";
import { sessionMiddleware } from "../middlewares";
import { requireRoleLevel } from "../middlewares/role.middleware";
import { EquipmentService , SessionService, UserService } from "../services/mongoose/services";

export class EquipmentController {
  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {}
  async getAll(_req: Request, res: Response) {
    const equipments = await this.equipmentService.findAll();
    res.json(equipments);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ _error: "ID manquant" });
    }
    
    const equipment = await this.equipmentService.findById(id);
    if (!equipment) return res.status(404).json({ _error: "Not found" });
    res.json(equipment);
  }

  async create(req: Request, res: Response) {
    if (!req.body || !req.body.name || !req.body.description) {
      return res.status(400).json({ _error: "Données manquantes" });
    }

    if (req.body.name && typeof req.body.name !== 'string') {
      return res.status(400).json({ _error: "Le nom doit être une chaîne de caractères" });
    }

    if (req.body.description && typeof req.body.description !== 'string') {
      return res.status(400).json({ _error: "La description doit être une chaîne de caractères" });
    }

    try {
      const equipment = await this.equipmentService.create(req.body);
      res.status(201).json(equipment);
    } catch (e) {
        console.error(e);
      res.status(400).json({ _error: "Invalid data or duplicate name" });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description } = req.body || {};

    if (!id) {
      return res.status(400).json({ _error: "ID manquant" });
    }

    if (!req.body || !req.body.name || !req.body.description) {
      return res.status(400).json({ _error: "Données manquantes" });
    }

    try {
      const equipment = await this.equipmentService.update(id, { name, description });
      if (!equipment) {
        return res.status(404).json({ _error: "Équipement non trouvé" });
      }
      res.json(equipment);
    } catch (e: unknown) {
        if (e instanceof Error) {
          res.status(400).json({ _error: e.message || "Erreur lors de la mise à jour de l'équipement" });
        } else {
          res.status(400).json({ _error: "Erreur lors de la mise à jour de l'équipement" });
        }
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ _error: "ID manquant" });
    }

    const ok = await this.equipmentService.delete(id);
    if (!ok) return res.status(404).json({ _error: "Not found" });
    res.json({ message: "Deleted" });
  }

  buildRouter(): Router {
    const router = Router();
    router.use(sessionMiddleware(this.sessionService, this.userService));
    router.get("/", this.getAll.bind(this));
    router.get("/:id", this.getById.bind(this));
    router.post("/", json(), requireRoleLevel(3), this.create.bind(this));
    router.put("/:id", json(), requireRoleLevel(3), this.update.bind(this));
    router.delete("/:id", requireRoleLevel(3), this.delete.bind(this));
    return router;
  }
}
