export class HexConstants {
  static isMobile = Math.min(window.innerWidth, window.innerHeight) < 500;

  static defaultWidth = 120;
  static defaultHeight = 140;
  static height = HexConstants.isMobile ? 50 : 120;
  static width = (HexConstants.defaultWidth / HexConstants.defaultHeight) * HexConstants.height;

  static smallHeight = 90 / 6;
  static smallWidth = (HexConstants.defaultWidth / HexConstants.defaultHeight) * HexConstants.smallHeight;
}
