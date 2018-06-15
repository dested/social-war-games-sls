import {Body, Controller, HttpException, HttpStatus, Post} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {AuthService} from '../auth/auth.service';
import {JwtGetUserResponse, LoginRequest, RegisterRequest} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import {FactionUtils} from '../../utils/factionUtils';

export class Timer {
    private startTime: number;
    private times: {key: string; time: number}[] = [];
    constructor() {
        this.startTime = +new Date();
    }

    public add(name: string) {
        this.times.push({
            key: name,
            time: +new Date() - this.startTime
        });
    }
    public print() {
        return this.times.map(a => a.key + ':' + a.time).join(' | ');
    }
}

@Controller('user')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @Post('/register')
    async register(@Body() model: RegisterRequest): Promise<JwtGetUserResponse> {
        const register = new Timer();
        const foundUsers = await DBUser.db.count(
            DBUser.db.query.parse((a, m) => a.email === m.email || a.userName === m.userName, model)
        );
        register.add('found users');
        if (foundUsers > 0) {
            throw new HttpException('Account already exists', HttpStatus.BAD_REQUEST);
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
        const jwt = await this.authService.createToken(httpUser);
        register.add('jwt');
        return {
            jwt,
            time: register.print(),
            user: httpUser
        };
    }

    @Post('/login')
    async login(@Body() model: LoginRequest): Promise<JwtGetUserResponse> {
        const login = new Timer();
        const query = DBUser.db.query.parse((a, email) => a.email === email, model.email);
        login.add('query');
        const user = await DBUser.db.getOne(query);
        login.add('get db');
        if (!user) {
            await bcrypt.compare('dog', 'cat');
            throw new HttpException('Email or Password Incorrect', HttpStatus.BAD_REQUEST);
        }

        if (!await bcrypt.compare(model.password, user.passwordHash)) {
            throw new HttpException('Email or Password Incorrect', HttpStatus.BAD_REQUEST);
        }
        login.add('bcrypt');

        const httpUser = DBUser.map(user);
        const jwt = await this.authService.createToken(httpUser);
        login.add('jwt');
        return {
            jwt,
            time: login.print(),
            user: httpUser
        };
    }
}
