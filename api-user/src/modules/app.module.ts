import {Module, NestModule, RequestMethod} from '@nestjs/common';
import {MiddlewaresConsumer} from '@nestjs/common/interfaces/middlewares';
import {HelmetMiddleware} from '@nest-middlewares/helmet';
import {AuthService} from './auth/auth.service';
import {JwtStrategy} from './auth/passport/jwtStragegy';
import {CheckController} from './controllers/checkController';
import {UserController} from './controllers/userController';
import {CorsMiddleware} from '@nest-middlewares/cors';

@Module({
    modules: [],
    components: [AuthService, JwtStrategy],
    controllers: [UserController, CheckController]
})
export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        HelmetMiddleware.configure({});
        consumer.apply(CorsMiddleware).forRoutes({path: '/*', method: RequestMethod.ALL});
    }
}
