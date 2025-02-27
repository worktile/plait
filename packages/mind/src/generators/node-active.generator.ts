import {
    ACTIVE_STROKE_WIDTH,
    PlaitBoard,
    RectangleClient,
    SELECTION_RECTANGLE_CLASS_NAME,
    createG,
    drawRoundRectangle,
    toActiveRectangleFromViewBoxRectangle
} from '@plait/core';
import { MindElement, BaseData } from '../interfaces';
import { getRectangleByNode } from '../utils/position/node';
import { PRIMARY_COLOR } from '../constants/default';
import { AbstractNode } from '@plait/layouts';
import { drawAbstractIncludedOutline } from '../utils/draw/abstract-outline';
import { AbstractHandlePosition } from '../plugins/with-abstract-resize.board';
import { DefaultNodeStyle } from '../constants/node-style';
import { getStrokeWidthByElement } from '../utils/node-style/shape';
import { Generator } from '@plait/common';

export interface ActiveData {
    selected: boolean;
}

export class NodeActiveGenerator extends Generator<MindElement, ActiveData> {
    static key = 'mind-node-active';

    abstractOutlineG?: SVGGElement;

    canDraw(element: MindElement<BaseData>, data: ActiveData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    draw(element: MindElement<BaseData>, data: ActiveData): SVGGElement {
        const activeG = createG();
        const node = MindElement.getNode(element);
        const rectangle = getRectangleByNode(node);
        const activeRectangle1 = toActiveRectangleFromViewBoxRectangle(this.board, rectangle);
        const strokeWidth = getStrokeWidthByElement(this.board, element);
        const activeStrokeWidth = ACTIVE_STROKE_WIDTH;
        const activeRectangleWithInflated = RectangleClient.inflate(activeRectangle1, activeStrokeWidth);
        const strokeG = drawRoundRectangle(
            PlaitBoard.getRoughSVG(this.board),
            activeRectangleWithInflated.x,
            activeRectangleWithInflated.y,
            activeRectangleWithInflated.x + activeRectangleWithInflated.width,
            activeRectangleWithInflated.y + activeRectangleWithInflated.height,
            { stroke: PRIMARY_COLOR, strokeWidth: activeStrokeWidth, fill: '' },
            true,
            DefaultNodeStyle.shape.rectangleRadius + (activeStrokeWidth + strokeWidth) / 2
        );
        if (AbstractNode.isAbstract(element)) {
            this.abstractOutlineG = drawAbstractIncludedOutline(this.board, PlaitBoard.getRoughSVG(this.board), element);
            activeG.append(this.abstractOutlineG);
            strokeG.classList.add('abstract-element');
        }
        activeG.appendChild(strokeG);
        activeG.classList.add(SELECTION_RECTANGLE_CLASS_NAME);
        return activeG;
    }

    updateAbstractOutline(element: MindElement, activeHandlePosition?: AbstractHandlePosition, resizingLocation?: number) {
        const abstractOutlineG = drawAbstractIncludedOutline(
            this.board,
            PlaitBoard.getRoughSVG(this.board),
            element,
            activeHandlePosition,
            resizingLocation
        );
        if (this.abstractOutlineG) {
            this.abstractOutlineG.replaceWith(abstractOutlineG);
            this.abstractOutlineG = abstractOutlineG;
        }
    }
}
