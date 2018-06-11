import {Body, Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {AuthService} from '../auth/auth.service';
import {AuthGuard} from '../guards/authGuard';
import {
    JwtGetUserResponse,
    LadderResponse,
    LoginRequest,
    RegisterRequest
} from '@swg-common/models/http/userController';
import {DBUser} from '@swg-server-common/db/models/dbUser';
import {FactionUtils} from '../../utils/factionUtils';
import {StatsResponse} from '@swg-common/models/http/userController';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {DBRoundStats} from '@swg-server-common/db/models/dbRoundStats';
import {DBUserRoundStatDetails, DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {DBLadder} from '@swg-server-common/db/models/dbLadder';

@Controller('ladder')
export class LadderController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    async getLadder(@Req() req: HttpUser): Promise<LadderResponse> {
        const ladder = await DBLadder.getLadder(req.id);
        return {
            ladder
        };
    }
}
