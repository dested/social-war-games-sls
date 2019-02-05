import {EntityAction, EntityType} from '../game/entityDetail';
import {ResourceType} from '../game/gameResource';
import {TileSubType, TileType} from '../game/hexagonTypes';
import {GameLayout, GameLayoutHex} from '../models/gameLayout';
import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';
import {Utils} from '../utils/utils';

export class ParserEnumUtils {
  static hexTypeToInt(type: TileType): number {
    switch (type) {
      case 'Dirt':
        return 1;
      case 'Clay':
        return 2;
      case 'Grass':
        return 3;
      case 'Stone':
        return 4;
      case 'Water':
        return 5;
    }
  }

  static hexSubTypeToInt(type: TileSubType): number {
    switch (type) {
      case '1':
        return 1;
      case '2':
        return 2;
      case '3':
        return 3;
      case '4':
        return 4;
      case '5':
        return 5;
    }
  }

  static intToHexType(type: number): TileType {
    switch (type) {
      case 1:
        return 'Dirt';
      case 2:
        return 'Clay';
      case 3:
        return 'Grass';
      case 4:
        return 'Stone';
      case 5:
        return 'Water';
    }
  }

  static intToHexSubType(type: number): TileSubType {
    switch (type) {
      case 1:
        return '1';
      case 2:
        return '2';
      case 3:
        return '3';
      case 4:
        return '4';
      case 5:
        return '5';
    }
  }
  static resourceTypeToInt(type: ResourceType): number {
    switch (type) {
      case 'bronze':
        return 1;
      case 'gold':
        return 2;
      case 'silver':
        return 3;
    }
  }

  static intToResourceType(type: number): ResourceType {
    switch (type) {
      case 1:
        return 'bronze';
      case 2:
        return 'gold';
      case 3:
        return 'silver';
    }
  }

  static entityTypeToInt(type: EntityType): number {
    switch (type) {
      case 'infantry':
        return 1;
      case 'tank':
        return 2;
      case 'factory':
        return 3;
      case 'plane':
        return 4;
    }
  }

  static intToEntityType(type: number): EntityType {
    switch (type) {
      case 1:
        return 'infantry';
      case 2:
        return 'tank';
      case 3:
        return 'factory';
      case 4:
        return 'plane';
    }
  }

  static actionToInt(action: EntityAction): number {
    switch (action) {
      case 'attack':
        return 1;
      case 'move':
        return 2;
      case 'mine':
        return 3;
      case 'spawn-plane':
        return 4;
      case 'spawn-tank':
        return 5;
      case 'spawn-infantry':
        return 6;
    }
  }

  static intToAction(action: number): EntityAction {
    switch (action) {
      case 1:
        return 'attack';
      case 2:
        return 'move';
      case 3:
        return 'mine';
      case 4:
        return 'spawn-plane';
      case 5:
        return 'spawn-tank';
      case 6:
        return 'spawn-infantry';
    }
  }

  static writeHexId(hexId: string, buff: ArrayBufferBuilder) {
    const hexIdParse = /(-?\d*)-(-?\d*)/;
    const hexIdResult = hexIdParse.exec(hexId);
    const x = parseInt(hexIdResult[1]);
    const y = parseInt(hexIdResult[2]);
    buff.addInt16(x);
    buff.addInt16(y);
  }

  static readHex(reader: ArrayBufferReader) {
    const x = reader.readInt16();
    const y = reader.readInt16();
    return {x, y, id: x + '-' + y};
  }
  static readHexId(reader: ArrayBufferReader) {
    const x = reader.readInt16();
    const y = reader.readInt16();
    return x + '-' + y;
  }
}
