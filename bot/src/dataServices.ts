import {JwtGetUserResponse, LadderResponse} from '@swg-common/models/http/userController';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {RoundState} from '@swg-common/models/roundState';

import {EntityAction, PlayableFactionId} from '@swg-common/game/entityDetail';
import {VoteRequestResults} from '@swg-common/models/http/voteResults';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {VoteResult} from '@swg-common/game/voteResult';
import {FactionStats} from '@swg-common/models/factionStats';
import {FactionRoundStats} from '@swg-common/models/roundStats';
import fetch from 'node-fetch';

export class DataService {
    private static userServer: string = 'https://user.socialwargames.com';
    // private static userServer: string = 'http://localhost:4569';
    private static voteServer: string = 'https://api.socialwargames.com';
    private static s3Server: string = 'https://s3-us-west-2.amazonaws.com/swg-content';

    static async login(email: string, password: string): Promise<JwtGetUserResponse> {
        let response = await fetch(this.userServer + '/user/login', {
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

        return json;
    }

    static async register(email: string, userName: string, password: string): Promise<JwtGetUserResponse> {
        let response = await fetch(this.userServer + '/user/register', {
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
        return await response.json();
    }

    static async vote(
        vote: {
            entityId: string;
            action: EntityAction;
            generation: number;
            hexId: string;
        },
        jwt: string
    ): Promise<{reason: VoteRequestResults; voteResult?: VoteResult; votesLeft: number; processedTime: number}> {
        let response = await fetch(this.voteServer + '/vote', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jwt
            },
            body: JSON.stringify(vote)
        });
        const body = await response.json();
        try {
            return JSON.parse(body.body);
        } catch (ex) {
            console.log(body);
            return null;
        }
    }

    static async currentUserDetails(jwt: string): Promise<UserDetails> {
        let response = await fetch(this.voteServer + '/user', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jwt
            }
        });

        const body = await response.json();
        return body.body;
    }

    static async getLayout() {
        let response = await fetch(this.s3Server + '/layout.json', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return (await response.json()) as GameLayout;
    }

    static async getGameState(factionId: PlayableFactionId): Promise<GameState> {
        let response = await fetch(`${this.s3Server}/game-state-${factionId}.json?bust=${+new Date()}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return (await response.json()) as GameState;
    }

    static async getLadder(jwt: string) {
        let response = await fetch(this.userServer + '/ladder', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(jwt ? {Authorization: 'Bearer ' + jwt} : {})
            }
        });
        return (await response.json()) as LadderResponse;
    }

    static async getFactionStats() {
        let response = await fetch(`${this.s3Server}/faction-stats.json?bust=${+new Date()}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return (await response.json()) as FactionStats;
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
