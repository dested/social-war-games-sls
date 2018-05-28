import {JwtGetUserResponse} from '@swg-common/models/http/userController';
import {EntityAction} from '@swg-common/game';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {RoundState} from '@swg-common/models/roundState';

import {getState} from './store';

export class DataService {
    // private static voteServer: string = 'https://vote.socialwargames.com/';
    private static userServer: string = 'http://localhost:4569';
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

    static async register(email: string, password: string): Promise<JwtGetUserResponse> {
        let response = await fetch(this.userServer + '/user/register', {
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

    static async vote(vote: {
        entityId: string;
        action: EntityAction;
        generation: number;
        hexId: string;
    }): Promise<void> {
        const state = getState();

        let response = await fetch(this.voteServer + '/vote', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + state.appState.jwt
            },
            body: JSON.stringify(vote)
        });
        return await response.json();
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

    static async getGameState() {
        let response = await fetch(this.s3Server + '/game-state.json?bust='+(+new Date()), {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return (await response.json()) as GameState;
    }

    static async getRoundState() {
        let response = await fetch(this.s3Server + '/round-state.json?bust='+(+new Date()), {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return (await response.json()) as RoundState;
    }
}
