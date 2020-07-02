import {SchemaDefiner} from 'swg-common/src/schemaDefiner/schemaDefiner';
import {
  GameState,
  GameStateSchema,
  GameStateSchemaAdderFunction,
  GameStateSchemaAdderSizeFunction,
  GameStateSchemaReaderFunction,
} from 'swg-common/src/models/gameState';

async function main() {
  console.log('here');
  const GameStateSchemaReaderFunction = SchemaDefiner.generateReaderFunction(GameStateSchema);
  const GameStateSchemaAdderFunction = SchemaDefiner.generateAdderFunction(GameStateSchema);
  const GameStateSchemaAdderSizeFunction = SchemaDefiner.generateAdderSizeFunction(GameStateSchema);
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
