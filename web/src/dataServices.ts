import {JwtGetUserResponse} from 'swg-common/bin/models/http/userController';
import {EntityAction} from '../../common/src/game';
import {getState} from './store';

export class DataService {
    // private static voteServer: string = 'https://vote.socialwargames.com/';
    private static userServer: string = 'http://localhost:4568';
    private static voteServer: string = 'https://api.socialwargames.com';

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
    /*
    static async getGameMetrics(): Promise<GameMetrics> {
        try {
            let response = await fetch(this.voteServer + 'api/game/metrics', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) // or check for response.status
                throw new Error(response.statusText);
            let json = await response.json();

            var m = await WorkerService.deflate(json.data);
            if (!m.metrics)return null;
            m.metrics.nextGenerationDate = new Date(m.metrics.nextGeneration);
            return m.metrics;
        } catch (ex) {
            console.error('Fetch Error :-S', ex);
            return null;
        }
    }

    static async vote(vote: { entityId: string, action: PossibleActions, userId: string, generation: number, x: number, z: number }): Promise<VoteResponse> {
        try {
            let response = await fetch(this.voteServer + 'api/game/vote', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vote)
            });
            let json = await response.json();
            if (json.meta.errors) {
                console.error(json.meta.errors);
                return null;
            }

            return json.data;
        } catch (ex) {
            console.error(ex);
            return ex;
        }
    }

    static compressor = new Compressor();

    static async getGameState(): Promise<GameState> {
        try {
            let response = await fetch(this.voteServer + 'api/game/state', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) // or check for response.status
                throw new Error(response.statusText);
            let json = await response.json();

            var m = await WorkerService.deflate(json.data);

            return m.state;
        } catch (ex) {
            console.error('Fetch Error :-S', ex);
            return ex;
        }

    }

    static async getGenerationResult(generation: number): Promise<GameMetrics> {
        try {
            let response = await fetch(this.voteServer + 'api/game/result?generation=' + generation, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) // or check for response.status
                throw new Error(response.statusText);
            let json = await response.json();
            var m = await WorkerService.deflate(json.data);

            return m.metrics;
        } catch (ex) {
            console.error('Fetch Error :-S', ex);
            return ex;
        }

    }*/
}
