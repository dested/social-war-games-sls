import { HttpUser } from "@swg-common/models/http/httpUser";
import {
  JwtGetUserResponse,
  RegisterRequestBody,
  StatsResponse
} from "@swg-common/models/http/userController";
import { Config } from "@swg-server-common/config";
import { DBUser } from "@swg-server-common/db/models/dbUser";
import { DBUserRoundStats } from "@swg-server-common/db/models/dbUserRoundStats";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Timer } from "../../common/src/utils/timer";
import { DataManager } from "../../server-common/src/db/dataManager";
import { AuthService } from "../utils/authService";
import { FactionUtils } from "../utils/factionUtils";
import { Event } from "../utils/models";
import { HttpResponse, respond } from "../utils/respond";

export async function userStatsHandler(
  event: Event<void>
): Promise<HttpResponse<StatsResponse>> {
  if (!event.headers || !event.headers.Authorization) {
    return respond(403, { error: "auth" });
  }
  await DataManager.openDbConnection();

  const user = jwt.verify(
    event.headers.Authorization.replace("Bearer ", ""),
    Config.jwtKey
  ) as HttpUser;

  const userStats = await DBUserRoundStats.getByUserId(user.id);
  return respond(200, {
    roundsParticipated: userStats.roundsParticipated
  });
}
