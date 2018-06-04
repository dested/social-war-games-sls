import {Catch, ExceptionFilter} from '@nestjs/common';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
    catch(exception: any, response: any) {
        if (exception.status)
            response.status(exception.status).json({
                message: exception.message
            });

        console.error(exception);
        response.status(500).json({
            message: `An internal server error has occurred.`
        });
    }
}
