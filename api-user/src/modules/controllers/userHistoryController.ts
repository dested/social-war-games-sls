import {Body, Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {AuthService} from '../auth/auth.service';
import {AuthGuard} from '../guards/authGuard';
import {JwtGetUserResponse, LoginRequest, RegisterRequest} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import {FactionUtils} from '../../utils/factionUtils';
import {StatsResponse} from '@swg-common/models/http/userController';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {DBRoundStats} from '@swg-server-common/db/models/dbRoundStats';
import {DBUserRoundStatDetails, DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';

@Controller('user-history')
export class UserHistoryController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard)
    @Get()
    async getStats(@Req() req: HttpUser): Promise<StatsResponse> {
        const userStats = await DBUserRoundStats.getByUserId(req.id);
        return {
            roundsParticipated: userStats.roundsParticipated
        };
    }
}
