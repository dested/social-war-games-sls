import {dCanvas} from './dCanvas';

const canvases: {[key: string]: HTMLCanvasElement} = {};
export function render(element: dCanvas.JSX.Element | dCanvas.JSX.Element[], context: CanvasRenderingContext2D = null) {
    if (Array.isArray(element)) {
        for (let i = 0; i < element.length; i++) {
            const child = element[i];
            render(child, context);
        }
    } else {
        switch (element.elementName) {
            case 'canvas':
                console.time('a')
                let canvas = canvases[element.props.key];
                if (!canvas) {
                    canvas = canvases[element.props.key] = document.createElement('canvas');
                    canvas.width = element.props.width;
                    canvas.height = element.props.height;
                }
                context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.save();
                context.translate(element.props.view.x, element.props.view.y);
                for (let i = 0; i < element.children.length; i++) {
                    const child = element.children[i];
                    render(child, context);
                }
                context.restore();
                console.timeEnd('a')

                return canvas;
            case 'image':
                context.drawImage(
                    element.props.src,
                    element.props.x,
                    element.props.y,
                    element.props.width,
                    element.props.height
                );
                break;
        }
    }
}
