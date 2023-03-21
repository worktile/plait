import { RoughSVG } from 'roughjs/bin/svg';
import { PlaitElement } from '../../../plait/src/interfaces/element';

export interface BaseDrawer {
    draw: (roughSVG: RoughSVG, element: PlaitElement) => SVGGElement[] | SVGGElement;
    update: (roughSVG: RoughSVG, element: PlaitElement, hostSVGG: SVGGElement[]) => SVGGElement[] | SVGGElement;
    destroy: (roughSVG: RoughSVG, element: PlaitElement, hostSVGG: SVGGElement[]) => void;
}
