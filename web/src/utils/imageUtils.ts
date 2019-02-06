import {gameStore} from '../store/game/store';

export class ImageUtils {
  static preloadImage(url: string) {
    const image = new Image();
    image.src = url;
    const imagesLoading = gameStore.imagesLoading || 0;
    gameStore.setImagesLoading(imagesLoading + 1);
    image.onload = () => {
      const imagesLeft = gameStore.imagesLoading;
      gameStore.setImagesLoading(imagesLeft - 1);
    };
    return image;
  }
}
