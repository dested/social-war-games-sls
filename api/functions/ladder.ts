import {LadderResponse, LoginRequestBody} from '@swg-common/models/http/userController';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';
import * as jwt from 'jsonwebtoken';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {Config} from '@swg-server-common/config';
import {DBLadder} from '@swg-server-common/db/models/dbLadder';
import {DataManager} from '@swg-server-common/db/dataManager';

export async function ladderHandler(event: Event<void>): Promise<HttpResponse<LadderResponse>> {
    console.log('auth', event);
    if (!event.headers || !event.headers.Authorization) return respond(403, {error: 'auth'});
    await DataManager.openDbConnection();

    const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;

    const ladder = await DBLadder.getLadder(user.id);
    return respond(200, {ladder});
}
