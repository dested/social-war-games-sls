import {Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {JwtModel} from 'swg-server-common/bin/http/jwtModel';
import {AuthService} from '../auth/auth.service';
import {AuthGuard} from '../guards/authGuard';
import {JwtGetUserResponse, LoginRequest, RegisterRequest} from 'swg-common/bin/models/http/userController';
import {DBUser} from 'swg-server-common/bin/db/models/dbUser';

@Controller('user')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @Post('/register')
    async register(@Body() model: RegisterRequest): Promise<JwtGetUserResponse> {
        const user = new DBUser();

        await DBUser.db.insertDocument(user);

        const httpUser = DBUser.map(user);
        const jwt = await this.authService.createToken(httpUser);
        return {
            jwt,
            email: '',
            maxVotesPerRound: 1,
            factionId: ''
        };
    }

    @Post('/login')
    async login(@Body() request: LoginRequest): Promise<JwtGetUserResponse> {
        /*let relationship: DBRelationship;
        let userNumber: UserNumber;
        if (request.email && request.password) {
            const relationships = await DBRelationship.db.getAll(
                DBRelationship.db.query.parse(
                    (m, params) =>
                        (m.user1.email === params.email && m.user1.passwordHash != null) ||
                        (m.user2.email === params.email && m.user2.passwordHash != null),
                    {
                        email: request.email
                    }
                )
            );

            for (const r of relationships) {
                if (r.user1.passwordHash && (await bcrypt.compare(request.password, r.user1.passwordHash))) {
                    relationship = r;
                    userNumber = '1';
                }
                if (r.user2.passwordHash && (await bcrypt.compare(request.password, r.user2.passwordHash))) {
                    relationship = r;
                    userNumber = '2';
                }
            }

            if (!relationship) {
                return Response.fail({
                    message: 'Invalid credentials'
                });
            }
        } else if (request.facebookId) {
            // todo this needs to verify the access token too
            relationship = await DBRelationship.db.getOne(
                DBRelationship.db.query.parse(
                    (m, params) => m.user1.facebookId === params.facebookId || m.user2.facebookId === params.facebookId,
                    {
                        facebookId: request.facebookId
                    }
                )
            );
            if (!relationship) {
                return Response.fail({
                    message: 'Invalid credentials'
                });
            }
            userNumber = relationship.user1.facebookId === request.facebookId ? '1' : '2';
        } else {
            throw new HttpException('Missing username and password', HttpStatus.BAD_REQUEST);
        }

        const httpRelationship = DBRelationship.map(relationship);
        const jwt = await this.authService.createToken(httpRelationship, userNumber);
*/
        const jwt = await this.authService.createToken(null);
        return {
            jwt,
            email: '',
            maxVotesPerRound: 1,
            factionId: ''
        };
    }

    @UseGuards(AuthGuard)
    @Get('/')
    async getStats(@Req() req: JwtModel): Promise<any> {
        return null;
    }
}
