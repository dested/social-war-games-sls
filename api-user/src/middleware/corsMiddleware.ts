import {ExpressMiddleware, Middleware, NestMiddleware} from '@nestjs/common';

@Middleware()
export class CorsMiddleware implements NestMiddleware {
    resolve(): ExpressMiddleware {
        return (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        };
    }
}
