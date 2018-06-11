import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AuthService} from '../auth/auth.service';
import {AuthGuard} from '../guards/authGuard';
import {StatsResponse} from '@swg-common/models/http/userController';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';

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
