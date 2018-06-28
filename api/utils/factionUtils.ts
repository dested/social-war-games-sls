import { PlayableFactionId } from "../../common/src/game/entityDetail";

export class FactionUtils {
  static randomFaction(): PlayableFactionId {
    return (Math.floor(Math.random() * 3) + 1).toString() as PlayableFactionId;
  }
}
