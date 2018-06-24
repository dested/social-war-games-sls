import {JwtGetUserResponse, LadderResponse} from '@swg-common/models/http/userController';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {RoundState} from '@swg-common/models/roundState';

import {EntityAction, PlayableFactionId} from '@swg-common/game/entityDetail';
import {VoteRequestResults, VoteResponse} from '@swg-common/models/http/voteResults';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {VoteResult} from '@swg-common/game/voteResult';
import {FactionStats} from '@swg-common/models/factionStats';
import {FactionRoundStats} from '@swg-common/models/roundStats';
import fetch from 'node-fetch';
import {GameLayoutParser} from '@swg-common/parsers/gameLayoutParser';
import {GameStateParser} from '@swg-common/parsers/gameStateParser';

export class DataService {
    private static apiServer: string = 'https://api.socialwargames.com';
    private static s3Server: string = 'https://s3-us-west-2.amazonaws.com/swg-content';

    static async login(email: string, password: string): Promise<JwtGetUserResponse> {
        let response = await fetch(this.apiServer + '/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok)
        // or check for response.status
            throw new Error(response.statusText);
        const json = await response.json();
        if (json.statusCode === 200) {
            return json.body;
        } else {
            throw new Error();
        }
    }

    static async register(email: string, userName: string, password: string): Promise<JwtGetUserResponse> {
        let response = await fetch(this.apiServer + '/register', {
            method: 'POST',
            body: JSON.stringify({
                email,
                userName,
                password
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok)
        // or check for response.status
            throw new Error(response.statusText);
        const json = await response.json();
        if (json.statusCode === 200) {
            return json.body;
        } else {
            throw new Error();
        }
    }

    static async vote(vote: {
        entityId: number;
        action: EntityAction;
        generation: number;
        hexId: string;
    },jwt:string): Promise<VoteResponse> {

        let response = await fetch(this.apiServer + '/vote', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jwt
            },
            body: JSON.stringify(vote)
        });
        const json = await response.json();
        return json.body;
    }

    static async currentUserDetails(jwt:string): Promise<UserDetails> {
        let response = await fetch(this.apiServer + '/user-details', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jwt
            }
        });

        const json = await response.json();
        return json.body;
    }

    static async getLayout() {
        let response = await fetch(this.s3Server + '/layout.swg', {
            method: 'GET',
            headers: {
                Accept: 'application/octet-stream',
                'Content-Type': 'application/octet-stream'
            }
        });
        const arrayBuffer = (await response.arrayBuffer());
        return GameLayoutParser.toGameLayout(new Uint8Array(arrayBuffer));
    }

    static async getGameState(factionId: PlayableFactionId): Promise<GameState> {
        let response = await fetch(`${this.s3Server}/game-state-${factionId}.swg?bust=${+new Date()}`, {
            method: 'GET',
            headers: {
                Accept: 'application/octet-stream',
                'Content-Type': 'application/octet-stream'
            }
        });
        const arrayBuffer = (await response.arrayBuffer());
        return GameStateParser.toGameState(new Uint8Array(arrayBuffer));
    }

    static async getLadder(jwt:string) {

        let response = await fetch(this.apiServer + '/ladder', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(jwt ? {Authorization: 'Bearer ' + jwt} : {})
            }
        });
        const json = await response.json();
        return json.body;
    }

    static async getFactionStats(generation: number): Promise<FactionStats[]> {
        let response = await fetch(`${this.s3Server}/faction-stats.json?bust=${generation}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    static async getFactionRoundStats(generation: number, factionId: PlayableFactionId) {
        let response = await fetch(`${this.s3Server}/round-outcomes/round-outcome-${generation}-${factionId}.json`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return (await response.json()) as FactionRoundStats;
    }
}
