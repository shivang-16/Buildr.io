import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/Notification";
import { checkAuth } from "../middlewares/checkAuth";

const router: Router = Router();

router.use(checkAuth);

router.get("/", getNotifications);
router.put("/:notificationId/read", markAsRead);

export default router;
