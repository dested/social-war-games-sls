import {Body, Controller, HttpException, HttpStatus, Post} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {AuthService} from '../auth/auth.service';
import {JwtGetUserResponse, LoginRequest, RegisterRequest} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import {FactionUtils} from '../../utils/factionUtils';

@Controller('user')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @Post('/register')
    async register(@Body() model: RegisterRequest): Promise<JwtGetUserResponse> {
        const foundUsers = await DBUser.db.count(
            DBUser.db.query.parse((a, m) => a.email === m.email || a.userName === m.userName, model)
        );
        if (foundUsers > 0) {
            throw new HttpException('Account already exists', HttpStatus.BAD_REQUEST);
        }
        const user = new DBUser();
        user.email = model.email;
        user.userName = model.userName;
        user.maxVotesPerRound = 3;
        user.passwordHash = await bcrypt.hash(model.password, 10);
        user.factionId = FactionUtils.randomFaction();
        user.createdDate = new Date();

        await DBUser.db.insertDocument(user);

        const httpUser = DBUser.map(user);
        const jwt = await this.authService.createToken(httpUser);
        return {
            jwt,
            user: httpUser
        };
    }

    @Post('/login')
    async login(@Body() model: LoginRequest): Promise<JwtGetUserResponse> {
        const user = await DBUser.db.getOne(DBUser.db.query.parse((a, email) => a.email === email, model.email));

        if (!user) {
            await bcrypt.compare('dog', 'cat');
            throw new HttpException('Email or Password Incorrect', HttpStatus.BAD_REQUEST);
        }

        if (!await bcrypt.compare(model.password, user.passwordHash)) {
            throw new HttpException('Email or Password Incorrect', HttpStatus.BAD_REQUEST);
        }

        const httpUser = DBUser.map(user);
        const jwt = await this.authService.createToken(httpUser);
        return {
            jwt,
            user: httpUser
        };
    }
}
