import { PlaitBoard, createG, drawRoundRectangle } from '@plait/core';
import { MindElement, BaseData } from '../interfaces';
import { BaseDrawer } from '../base/base.drawer';
import { getRectangleByNode } from '../utils/position/node';
import { PRIMARY_COLOR } from '../constants/default';
import { AbstractNode } from '@plait/layouts';
import { drawAbstractIncludedOutline } from '../utils/draw/abstract-outline';
import { AbstractHandlePosition } from '../plugins/with-abstract-resize.board';

export class NodeActiveDrawer extends BaseDrawer<{ selected: boolean }> {
    abstractOutlineG?: SVGGElement;

    canDraw(element: MindElement<BaseData>, data: { selected: boolean }): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    baseDraw(element: MindElement<BaseData>): SVGGElement {
        const activeG = createG();
        this.g = activeG;

        if (AbstractNode.isAbstract(element)) {
            this.abstractOutlineG = drawAbstractIncludedOutline(this.board, PlaitBoard.getRoughSVG(this.board), element);
            activeG.append(this.abstractOutlineG);
        }
        const node = MindElement.getNode(element);
        let { x, y, width, height } = getRectangleByNode(node);
        const strokeG = drawRoundRectangle(
            PlaitBoard.getRoughSVG(this.board),
            x - 2,
            y - 2,
            x + width + 2,
            y + height + 2,
            { stroke: PRIMARY_COLOR, strokeWidth: 2, fill: '' },
            true
        );
        this.g.appendChild(strokeG);

        const fillG = drawRoundRectangle(
            PlaitBoard.getRoughSVG(this.board),
            x - 2,
            y - 2,
            x + width + 2,
            y + height + 2,
            { stroke: PRIMARY_COLOR, fill: PRIMARY_COLOR, fillStyle: 'solid' },
            true
        );
        fillG.style.opacity = '0.15';
        this.g.appendChild(fillG);
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
