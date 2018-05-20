import {Controller, Get} from '@nestjs/common';

@Controller('check')
export class CheckController {
    @Get()
    check(): boolean {
        return true;
    }
}
