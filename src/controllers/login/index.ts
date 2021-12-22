import { Router } from "express";

import { postLogin } from "./login.ctrl";

const router: Router = Router();

router.post("/login", postLogin);

export default router;
