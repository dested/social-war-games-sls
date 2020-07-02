import {SchemaDefiner} from 'swg-common/src/schemaDefiner/schemaDefiner';
import {
  GameState,
  GameStateSchema,
  GameStateSchemaAdderFunction,
  GameStateSchemaAdderSizeFunction,
  GameStateSchemaReaderFunction,
} from 'swg-common/src/models/gameState';
import {setupHandler} from './functions/setup';
import {workHandler} from './functions/work';
import {roundUpdateHandler} from './functions/roundUpdate';

async function main() {
  console.log('here');
  debugger;
  await setupHandler(undefined);
  await workHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await workHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await workHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await roundUpdateHandler(undefined);
  await workHandler(undefined);

  /* debugger;
  const result = SchemaDefiner.startAddSchemaBuffer(
    testGameState,
    GameStateSchemaAdderSizeFunction,
    GameStateSchemaAdderFunction
  );
  console.log(result.byteLength);
  const resultReader: GameState = SchemaDefiner.startReadSchemaBuffer(result, GameStateSchemaReaderFunction);
  console.log(resultReader.factions.length, testGameState.factions.length);

  console.log(JSON.stringify(resultReader));*/
}

main()
  .then((c) => console.log(c))
  .catch((c) => console.log(c));
