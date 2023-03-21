import { RoughSVG } from 'roughjs/bin/svg';
import { PlaitElement } from '../../../plait/src/interfaces';
import { BaseDrawer } from './base-drawer';

export const roughCommonDrawer: BaseDrawer = {
    draw(roughSVG: RoughSVG, element: PlaitElement) {
        if (element.type === 'rectangle' && element.points) {
            const start = element.points[0];
            const end = element.points[1];
            return roughSVG.rectangle(start[0], start[1], end[0] - start[0], end[1] - start[1], {
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                fill: element.fill,
                fillStyle: element.fillStyle
            });
        }
        throw new Error(`draw unknow ${element}`);
    },
    update(roughSVG: RoughSVG, element: PlaitElement, hostSVGG: SVGGElement[]) {
        hostSVGG.forEach(g => g.remove());
        return roughCommonDrawer.draw(roughSVG, element);
    },
    destroy(roughSVG: RoughSVG, element: PlaitElement, hostSVGG: SVGGElement[]) {
        hostSVGG.forEach(g => g.remove());
    }
};
