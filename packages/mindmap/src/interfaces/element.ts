import { Element } from 'slate';
import { MindmapNodeShape } from '../constants/node';
import { isIndentedLayout, MindmapLayoutType } from '@plait/layouts';
import { NODE_TO_PARENT, PlaitBoard, PlaitElement, PlaitNode, Point } from '@plait/core';
import { MindmapQueries } from '../queries';

export interface MindmapNodeElement extends PlaitElement {
    value: Element;
    children: MindmapNodeElement[];
    rightNodeCount?: number;
    width: number;
    height: number;
    isRoot?: boolean;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    shape?: MindmapNodeShape;

    // link style attributes
    linkLineColor?: string;
    linkLineWidth?: number;

    // layout
    layout?: MindmapLayoutType;
    isCollapsed?: boolean;
}

export interface PlaitMindmap extends MindmapNodeElement {
    type: 'mindmap';
    points: Point[];
}

export const PlaitMindmap = {
    isMindmap: (value: any): value is PlaitMindmap => {
        return value.type === 'mindmap';
    }
};

export const MindmapNodeElement = {
    hasLayout(value: MindmapNodeElement, layout: MindmapLayoutType) {
        const _layout = MindmapQueries.getLayoutByElement(value);
        return _layout === layout;
    },
    isIndentedLayout(value: MindmapNodeElement) {
        const _layout = MindmapQueries.getLayoutByElement(value) as MindmapLayoutType;
        return isIndentedLayout(_layout);
    },
    isMindmapNodeElement(board: PlaitBoard, element: PlaitElement): element is MindmapNodeElement {
        const path = PlaitBoard.findPath(board, element);
        const rootElement = PlaitNode.get(board, path.slice(0, 1));
        if (PlaitMindmap.isMindmap(rootElement)) {
            return true;
        } else {
            return false;
        }
    },
    getParent(node: MindmapNodeElement) {
        if (PlaitMindmap.isMindmap(node)) {
            throw new Error('mind root node can not get parent');
        }
        const parent = NODE_TO_PARENT.get(node) as MindmapNodeElement;
        return parent;
    }
};
