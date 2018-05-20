export interface RegisterRequest {
    email: string;
    password: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface JwtGetUserResponse extends GetUserResponse {
    jwt: string;
}
export interface GetUserResponse {
    email: string;
    factionId: string;
    maxVotesPerRound: number;
}
