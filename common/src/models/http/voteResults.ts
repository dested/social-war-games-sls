import {VoteResult} from '../../game/voteResult';

export type VoteRequestResults = 'ok' | 'error' | 'vote_failed' | 'bad_generation' | 'max_votes' | 'stopped' | 'auth' | 'cant_vote_twice';

export interface VoteResponse {
    reason: VoteRequestResults;
    voteResult?: VoteResult;
    votesLeft: number;
    processedTime: number
}