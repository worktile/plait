import { Element } from 'slate';
import { MindmapNodeShape } from '../constants/node';
import { isIndentedLayout, MindmapLayoutType } from '@plait/layouts';
import { PlaitBoard, PlaitElement, Point } from '@plait/core';
import { MindmapQueries } from '../queries';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils';

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
    isPlaitMindmap: (value: any): value is PlaitMindmap => {
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
    isMindmapNodeElement(board: PlaitBoard, element: PlaitElement) {
        return !!MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement);
    }
};
