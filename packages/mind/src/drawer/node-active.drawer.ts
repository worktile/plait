import { PlaitBoard, RectangleClient, createG, drawRoundRectangle } from '@plait/core';
import { MindElement, BaseData } from '../interfaces';
import { BaseDrawer } from '../base/base.drawer';
import { getRectangleByNode } from '../utils/position/node';
import { PRIMARY_COLOR } from '../constants/default';
import { AbstractNode } from '@plait/layouts';
import { drawAbstractIncludedOutline } from '../utils/draw/abstract-outline';
import { AbstractHandlePosition } from '../plugins/with-abstract-resize.board';
import { DefaultNodeStyle } from '../constants/node-style';
import { getStrokeWidthByElement } from '../utils/node-style/shape';

export interface ActiveData {
    selected: boolean;
    isEditing: boolean;
}

export class NodeActiveDrawer extends BaseDrawer<ActiveData> {
    abstractOutlineG?: SVGGElement;

    canDraw(element: MindElement<BaseData>, data: ActiveData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    baseDraw(element: MindElement<BaseData>, data: ActiveData): SVGGElement {
        const activeG = createG();
        this.g = activeG;

        if (AbstractNode.isAbstract(element)) {
            this.abstractOutlineG = drawAbstractIncludedOutline(this.board, PlaitBoard.getRoughSVG(this.board), element);
            activeG.append(this.abstractOutlineG);
        }
        const node = MindElement.getNode(element);
        const rectangle = getRectangleByNode(node);
        const activeStrokeWidth = 2;
        // add 0.1 to avoid white gap
        const offset = (getStrokeWidthByElement(this.board, element) + activeStrokeWidth) / 2 - 0.1;
        const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);
        const strokeG = drawRoundRectangle(
            PlaitBoard.getRoughSVG(this.board),
            activeRectangle.x,
            activeRectangle.y,
            activeRectangle.x + activeRectangle.width,
            activeRectangle.y + activeRectangle.height,
            { stroke: PRIMARY_COLOR, strokeWidth: activeStrokeWidth, fill: '' },
            true,
            DefaultNodeStyle.shape.rectangleRadius + offset
        );
        this.g.appendChild(strokeG);
        return activeG;
    }

    updateAbstractOutline(element: MindElement, activeHandlePosition?: AbstractHandlePosition, resizingLocation?: number) {
        if (this.abstractOutlineG) {
            this.abstractOutlineG.remove();
        }
        this.abstractOutlineG = drawAbstractIncludedOutline(
            this.board,
            PlaitBoard.getRoughSVG(this.board),
            element,
            activeHandlePosition,
            resizingLocation
        );
        this.g!.append(this.abstractOutlineG);
    }
}
