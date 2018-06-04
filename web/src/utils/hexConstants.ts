export class HexConstants {
    static defaultWidth = 120;
    static defaultHeight = 140;
    static height = 90;
    static width = HexConstants.defaultWidth / HexConstants.defaultHeight * HexConstants.height;

    static smallHeight = HexConstants.height / 6;
    static smallWidth = HexConstants.defaultWidth / HexConstants.defaultHeight * HexConstants.smallHeight;
}
