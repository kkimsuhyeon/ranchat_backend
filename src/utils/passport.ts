import { getRepository } from "typeorm";
import passport from "passport";
import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from "passport-jwt";

import { User } from "../entities/User";

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: "secret",
};

const verifyUser: VerifyCallback = async (payload, done) => {
  console.log(payload);
  try {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: payload.id } });

    if (user !== null) return done(null, user);
    return done(null, false);
  } catch (e) {
    return done(e, false);
  }
};

passport.use(new Strategy(jwtOptions, verifyUser));
