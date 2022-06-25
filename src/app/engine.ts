import { Point } from 'roughjs/bin/geometry';
import { RoughSVG } from 'roughjs/bin/svg';
import { arrowDetector } from './detector/arrow';
import { BaseDetector } from './detector/base';
import { ellipseDetector } from './detector/ellipse';
import { lineDetector } from './detector/line';
import { rectangleDetector } from './detector/rectangle';
import { textDetector } from './detector/text';
import { BaseDrawer } from './drawer/base-drawer';
import { roughCommonDrawer } from './drawer/common-drawer';
import { richTextDrawer } from './drawer/richtext';
import { ElementType, Element } from './interfaces/element';
import { Selection } from './interfaces/selection';

export const roughDrawer: BaseDrawer = {
    draw(roughSVG: RoughSVG, element: Element) {
        return getDrawer(element).draw(roughSVG, element);
    },
    update(roughSVG: RoughSVG, element: Element, hostSVGG: SVGGElement[]) {
        return getDrawer(element).update(roughSVG, element, hostSVGG);
    },
    destroy(roughSVG: RoughSVG, element: Element, hostSVGG: SVGGElement[]) {
        return getDrawer(element).destroy(roughSVG, element, hostSVGG);
    }
};

export const detector: BaseDetector = {
    contian: (selection: Selection, element: Element) => {
        return getDetector(element).contian(selection, element);
    },
    hit: (point: Point, element: Element) => {
        return getDetector(element).hit(point, element);
    }
};

export function getDrawer(element: Element) {
    return graphicEngine[element.type].drawer;
}

export function getDetector(element: Element) {
    return graphicEngine[element.type].detector;
}

export const graphicEngine: GraphicEngineMap = {
    [ElementType.rectangle]: { drawer: roughCommonDrawer, detector: rectangleDetector },
    [ElementType.curve]: { drawer: roughCommonDrawer, detector: lineDetector },
    [ElementType.line]: { drawer: roughCommonDrawer, detector: lineDetector },
    [ElementType.arrow]: { drawer: roughCommonDrawer, detector: arrowDetector },
    [ElementType.circle]: { drawer: roughCommonDrawer, detector: ellipseDetector },
    [ElementType.text]: { drawer: richTextDrawer, detector: textDetector }
};

export interface GraphicEngineMap {
    [key: string]: GraphicEngineValue;
}

export interface GraphicEngineValue {
    drawer: BaseDrawer;
    detector: BaseDetector;
}
