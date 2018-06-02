import {getStore} from '../store';
import {GameActions} from '../store/game/actions';

export class ImageUtils{
    static preloadImage(url: string) {
        const image = new Image();
        image.src = url;
        let imagesLoading = getStore().getState().gameState.imagesLoading || 0;
        getStore().dispatch(GameActions.setImagesLoadingAction(imagesLoading + 1));
        image.onload = () => {
            let imagesLeft = getStore().getState().gameState.imagesLoading;
            getStore().dispatch(GameActions.setImagesLoadingAction(imagesLeft - 1));
        };
        return image;
    }

}