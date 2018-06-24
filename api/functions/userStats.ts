import * as bcrypt from 'bcryptjs';
import {JwtGetUserResponse, RegisterRequestBody, StatsResponse} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import {Timer} from '../../common/src/utils/timer';
import {Event} from '../utils/models';
import {AuthService} from '../utils/authService';
import {FactionUtils} from '../utils/factionUtils';
import {HttpResponse, respond} from '../utils/respond';
import {DataManager} from '../../server-common/src/db/dataManager';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import * as jwt from 'jsonwebtoken';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {Config} from '@swg-server-common/config';

export async function userStatsHandler(event: Event<void>): Promise<HttpResponse<StatsResponse>> {
    if (!event.headers || !event.headers.Authorization) return respond(403, {error: 'auth'});
    await DataManager.openDbConnection();

    const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;

    const userStats = await DBUserRoundStats.getByUserId(user.id);
    return respond(200, {
        roundsParticipated: userStats.roundsParticipated
    });
}
