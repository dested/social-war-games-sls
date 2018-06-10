import {VoteNote} from './voteNote';
import {OfFaction} from '../game/entityDetail';
import {ProcessedVote} from '../game/gameLogic';

export interface RoundStats {
    generation: number;
    winningVotes: OfFaction<ProcessedVote[]>;
    playersVoted: OfFaction<number>;
    scores: OfFaction<number>;
    hotEntities: OfFaction<{id: string; count: number}[]>;
    notes: OfFaction<VoteNote[]>;
}
export interface FactionRoundStats {
    generation: number;
    winningVotes: ProcessedVote[];
    totalPlayersVoted: number;
    playersVoted: number;
    score: number;
    hotEntities: {id: string; count: number}[];
    notes: VoteNote[];
}
