import { isIndentedLayout, MindLayoutType } from '@plait/layouts';
import { NODE_TO_PARENT, Path, PlaitBoard, PlaitElement, PlaitNode, Point } from '@plait/core';
import { MindQueries } from '../queries';
import { BaseData, EmojiData, ImageData } from './element-data';
import { StrokeStyle } from '@plait/common';
import { MIND_ELEMENT_TO_NODE } from '../utils/weak-maps';

export interface BaseMindElement extends PlaitElement {
    rightNodeCount?: number;
    manualWidth?: number;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;
    shape?: MindElementShape;

    // link style attributes
    branchColor?: string;
    branchWidth?: number;
    branchShape?: BranchShape;

    // layout
    layout?: MindLayoutType;
    isCollapsed?: boolean;

    start?: number;
    end?: number;
}

const LEGACY_MIND_TYPE = 'mindmap';

export interface MindElement<T = BaseData> extends BaseMindElement {
    type: 'mind_child' | 'mind' | 'mindmap';
    children: MindElement[];
    data: T;
}

export interface PlaitMind<T = BaseData> extends MindElement<T> {
    type: 'mind' | 'mindmap';
    points: Point[];
}

export const PlaitMind = {
    isMind: (value: any): value is PlaitMind => {
        return value.type === 'mind' || value.type === LEGACY_MIND_TYPE;
    }
};

export const MindElement = {
    hasLayout(value: MindElement, layout: MindLayoutType) {
        const _layout = MindQueries.getLayoutByElement(value);
        return _layout === layout;
    },
    isIndentedLayout(value: MindElement) {
        const _layout = MindQueries.getLayoutByElement(value) as MindLayoutType;
        return isIndentedLayout(_layout);
    },
    isMindElement(board: PlaitBoard | null, element: PlaitElement): element is MindElement {
        if ((element.data && element.data.topic) || element.type === 'mind_child') {
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
    findParent(node: MindElement) {
        if (PlaitMind.isMind(node)) {
            return undefined;
        }
        const parent = NODE_TO_PARENT.get(node) as MindElement;
        return parent;
    },
    getRoot(board: PlaitBoard, element: MindElement) {
        const path = PlaitBoard.findPath(board, element);
        return PlaitNode.get(board, path.slice(0, 1)) as PlaitMind;
    },
    getAncestors(board: PlaitBoard, element: MindElement) {
        const path = PlaitBoard.findPath(board, element);
        const parents: PlaitElement[] = [];
        for (const p of Path.ancestors(path, { reverse: true })) {
            const n = PlaitNode.get(board, p);
            if (n && !PlaitBoard.isBoard(n)) {
                parents.push(n);
            }
        }
        return parents;
    },
    getNode(element: MindElement) {
        const node = MIND_ELEMENT_TO_NODE.get(element);
        if (!node) {
            throw new Error(`can not get node from ${JSON.stringify(element)}`);
        }
        return node;
    },
    findParentNode(element: MindElement) {
        if (PlaitMind.isMind(element)) {
            return undefined;
        }
        const parent = MindElement.getParent(element);
        return MindElement.getNode(parent);
    },
    hasEmojis(element: MindElement): element is MindElement<EmojiData> {
        if (element.data.emojis) {
            return true;
        } else {
            return false;
        }
    },
    hasImage(element: MindElement): element is MindElement<ImageData> {
        if (element.data.image) {
            return true;
        } else {
            return false;
        }
    },
    getEmojis(element: MindElement<EmojiData>) {
        return element.data.emojis;
    }
};

export enum MindElementShape {
    roundRectangle = 'round-rectangle',
    underline = 'underline'
}

export enum BranchShape {
    bight = 'bight',
    polyline = 'polyline'
}
