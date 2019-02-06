import {HttpUser} from '@swg-common/models/http/httpUser';
import {LadderResponse, LoginRequestBody} from '@swg-common/models/http/userController';
import {Config} from '@swg-server-common/config';
import {DataManager} from '@swg-server-common/db/dataManager';
import {DBLadder} from '@swg-server-common/db/models/dbLadder';
import * as jwt from 'jsonwebtoken';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

export async function ladderHandler(event: Event<void>): Promise<HttpResponse<LadderResponse>> {
  if (!event.headers || !event.headers.Authorization || !event.headers.GameId) {
    return respond(403, {error: 'auth'});
  }
  await DataManager.openDbConnection();

  const user = jwt.verify(event.headers.Authorization.replace('Bearer ', ''), Config.jwtKey) as HttpUser;

  const ladder = await DBLadder.getLadder(event.headers.GameId, user.id);
  return respond(200, {ladder});
}
