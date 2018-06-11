import {Controller, Get, Req} from '@nestjs/common';
import {AuthService} from '../auth/auth.service';
import {
    LadderResponse} from '@swg-common/models/http/userController';
import {HttpUser} from '@swg-common/models/http/httpUser';
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
