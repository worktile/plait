import { Element } from 'slate';
import { MindmapNodeShape } from '../constants/node';
import { getLayoutByElement } from '../utils/layout';
import { isIndentedLayout, MindmapLayoutType } from '@plait/layouts';

export interface MindmapElement {
    id: string;
    value: Element;
    children: MindmapElement[];
    isRoot?: boolean;
    width: number;
    height: number;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    shape?: MindmapNodeShape;

    // link style attributes
    linkLineColor?: string;
    linkLineWidth?: number;

    // topic
    fontSize?: number;
    color?: string;

    // layout
    layout?: MindmapLayoutType;

    isCollapsed?: boolean;
}

export const MindmapElement = {
    hasLayout(value: MindmapElement, layout: MindmapLayoutType) {
        const _layout = getLayoutByElement(value);
        return _layout === layout;
    },
    isIndentedLayout(value: MindmapElement) {
        const _layout = getLayoutByElement(value) as MindmapLayoutType;
        return isIndentedLayout(_layout);
    }
};
