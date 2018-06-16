import {HexConstants} from './hexConstants';

export class UIConstants {
    static progressBarHeight =HexConstants.isMobile ? 20 :  30;
    static miniMapWidth = HexConstants.isMobile ? window.innerWidth : window.innerHeight * 0.25;
    static miniMapHeight = HexConstants.isMobile ? window.innerHeight * 0.20 : window.innerHeight * 0.25;
}
