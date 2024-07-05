import { PlaitBoard, createForeignObject, createG, normalizePoint } from '@plait/core';
import { Generator, RenderComponentRef } from '@plait/common';
import { ForceAtlasNodeElement } from '../../interfaces';
import { drawNode } from '../utils/draw';
import { NodeGeneratorData } from '../types';
import { ForceAtlasNodeIconBoard, NodeIconProps } from '../with-node-icon';
import { ACTIVE_NODE_ICON_FONT_SIZE, DEFAULT_NODE_BACKGROUND_COLOR, NODE_ICON_CLASS_NAME, NODE_ICON_FONT_SIZE } from '../constants';
import { getNodeIcon } from '../utils/node';

export class ForceAtlasNodeGenerator extends Generator<ForceAtlasNodeElement, NodeGeneratorData> {
    static key = 'force-atlas-node';

    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasNodeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasNodeElement, data: NodeGeneratorData) {
        const iconRef = this.drawIcon(element, data);
        return drawNode(this.board, element, element?.points?.[0] || [0, 0], { ...data, iconG: iconRef.iconG });
    }

    drawIcon(element: ForceAtlasNodeElement, data: NodeGeneratorData) {
        const iconG = createG();
        let { x, y } = normalizePoint(element.points?.[0] || [0, 0]);
        const size = element.size!;
        const foreignObject = createForeignObject(x - size / 2, y - size / 2, size, size);
        iconG.append(foreignObject);
        const container = document.createElement('div');
        container.classList.add(NODE_ICON_CLASS_NAME);
        foreignObject.append(container);
        const nodeIcon = getNodeIcon(element);
        const props: NodeIconProps = {
            iconItem: {
                name: nodeIcon.name
            },
            board: this.board,
            element: element,
            fontSize: data.isActive ? ACTIVE_NODE_ICON_FONT_SIZE : nodeIcon.fontSize,
            color: nodeIcon.color
        };
        const ref = ((this.board as unknown) as ForceAtlasNodeIconBoard).renderNodeIcon(container, props);
        return { ref, iconG };
    }
}
