import { Element } from 'slate';
import { MindmapNodeShape } from '../constants/node';
import { isIndentedLayout, MindmapLayoutType } from '@plait/layouts';
import { NODE_TO_PARENT, PlaitBoard, PlaitElement, PlaitNode, Point } from '@plait/core';
import { MindmapQueries } from '../queries';
import { ELEMENT_TO_NODE } from '../utils';
import { BaseData } from './element-data';

export interface MindElement<T = BaseData> extends PlaitElement {
    data: T;
    children: MindElement[];
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

    start?: number;
    end?: number;
}

export interface PlaitMind extends MindElement {
    type: 'mindmap';
    points: Point[];
}

export const PlaitMind = {
    isMind: (value: any): value is PlaitMind => {
        return value.type === 'mindmap';
    }
};

export const MindElement = {
    hasLayout(value: MindElement, layout: MindmapLayoutType) {
        const _layout = MindmapQueries.getLayoutByElement(value);
        return _layout === layout;
    },
    isIndentedLayout(value: MindElement) {
        const _layout = MindmapQueries.getLayoutByElement(value) as MindmapLayoutType;
        return isIndentedLayout(_layout);
    },
    isMindElement(board: PlaitBoard, element: PlaitElement): element is MindElement {
        const path = PlaitBoard.findPath(board, element);
        const rootElement = PlaitNode.get(board, path.slice(0, 1));
        if (PlaitMind.isMind(rootElement)) {
            return true;
        } else {
            return false;
        }
    },
    getParent(node: MindElement) {
        if (PlaitMind.isMind(node)) {
            throw new Error('mind root node can not get parent');
        }
        const parent = NODE_TO_PARENT.get(node) as MindElement;
        return parent;
    },
    getRoot(board: PlaitBoard, element: MindElement) {
        const path = PlaitBoard.findPath(board, element);
        return PlaitNode.get(board, path.slice(0, 1)) as PlaitMind;
    },
    getNode(board: PlaitBoard, element: MindElement) {
        const node = ELEMENT_TO_NODE.get(element);
        if (!node) {
            throw new Error(`can not get node from ${JSON.stringify(element)}`);
        }
        return node;
    }
};
