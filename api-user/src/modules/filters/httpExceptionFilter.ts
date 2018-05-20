import {Catch, ExceptionFilter} from '@nestjs/common';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
    catch(exception: any, response: any) {
        console.error(exception);
        response.status(500).json({
            statusCode: 500,
            message: `An internal server error has occurred.`
        });
    }
}
