import {Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {JwtModel} from 'swg-server-common/bin/http/jwtModel';
import {AuthService} from '../auth/auth.service';
import {AuthGuard} from '../guards/authGuard';
import {JwtGetUserResponse, LoginRequest, RegisterRequest} from 'swg-common/bin/models/http/userController';
import {DBUser} from 'swg-server-common/bin/db/models/dbUser';
import {FactionUtils} from '../../utils/factionUtils';
import {StatsResponse} from 'swg-common/bin/models/http/userController';

@Controller('user')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @Post('/register')
    async register(@Body() model: RegisterRequest): Promise<JwtGetUserResponse> {
        const foundUsers = await DBUser.db.count(DBUser.db.query.parse((a, email) => a.email === email, model.email));
        if (foundUsers > 0) {
            throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }
        const user = new DBUser();
        user.email = model.email;
        user.maxVotesPerRound = 5;
        user.passwordHash = await bcrypt.hash(model.password, 10);
        user.factionId = FactionUtils.randomFaction();
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

    @UseGuards(AuthGuard)
    @Get('/stats')
    async getStats(@Req() req: JwtModel): Promise<StatsResponse> {
        return {
            foo: true
        };
    }
}
