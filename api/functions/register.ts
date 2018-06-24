import * as bcrypt from 'bcryptjs';
import {JwtGetUserResponse, RegisterRequestBody} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import {Timer} from '../../common/src/utils/timer';
import {Event} from '../utils/models';
import {AuthService} from '../utils/authService';
import {FactionUtils} from '../utils/factionUtils';
import {HttpResponse, respond} from '../utils/respond';
import {DataManager} from '../../server-common/src/db/dataManager';

export async function registerHandler(event: Event<RegisterRequestBody>): Promise<HttpResponse<JwtGetUserResponse>> {
    const model = event.body;
    await DataManager.openDbConnection();

    const register = new Timer();
    const foundUsers = await DBUser.db.count(
        DBUser.db.query.parse((a, m) => a.email === m.email || a.userName === m.userName, model)
    );
    register.add('found users');
    if (foundUsers > 0) {
        return respond(400, {error: 'Account already exists'});
    }
    const user = new DBUser();
    user.email = model.email;
    user.userName = model.userName;
    user.maxVotesPerRound = 3;
    user.passwordHash = await bcrypt.hash(model.password, 3);
    register.add('bcrypt');
    user.factionId = FactionUtils.randomFaction();
    user.createdDate = new Date();

    await DBUser.db.insertDocument(user);
    register.add('insert');

    const httpUser = DBUser.map(user);
    const jwt = await AuthService.createToken(httpUser);
    register.add('jwt');
    return respond(200, {
        jwt,
        time: register.print(),
        user: httpUser
    });
}
