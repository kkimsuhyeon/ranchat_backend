import { Router } from "express";

import loginRouter from "./login";
import demoRouter from "./demo";

const router: Router = Router();

router.use("/", loginRouter);
router.use("/demo", demoRouter);

export default router;
