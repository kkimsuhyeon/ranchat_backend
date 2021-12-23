import { Router } from "express";

import { getDemo } from "./demo.ctrl";

const router: Router = Router();

router.get("/", getDemo);

export default router;
