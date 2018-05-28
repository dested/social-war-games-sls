import {NestFactory} from '@nestjs/core';
import {DataManager} from '@swg-server-common/db/dataManager';
import {ApplicationModule} from './modules/app.module';
import {AnyExceptionFilter} from './modules/filters/httpExceptionFilter';

async function bootstrap() {
    console.log(`Starting...`);
    console.log(`Connecting to database`);
    await DataManager.openDbConnection();
    const app = await NestFactory.create(ApplicationModule);
    app.useGlobalFilters(new AnyExceptionFilter());
    const port = parseInt(process.env.PORT || '4569', 10);
    console.log(`Serving started on port ${port}`);
    await app.listen(port);
}
bootstrap().catch(er => console.error(er));
