import {StatsResponse} from '@swg-common/models/http/userController';
import {DBGame} from '@swg-server-common/db/models/dbGame';
import {Event} from '../utils/models';
import {HttpResponse, respond} from '../utils/respond';

export async function getGamesHandler(event: Event<void>): Promise<HttpResponse<StatsResponse>> {
  const games = await DBGame.db.getAll({});
  return respond(200, {
    games: games.map(DBGame.map),
  });
}
