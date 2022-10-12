import { Element } from 'slate';
import { MindmapNodeShape } from '../constants/node';
import { isIndentedLayout, MindmapLayoutType } from '@plait/layouts';
import { MindmapQueries } from '../queries';

export interface MindmapElement {
    id: string;
    value: Element;
    children: MindmapElement[];
    isRoot?: boolean;
    rightNodeCount?: number;
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

    // layout
    layout?: MindmapLayoutType;

    isCollapsed?: boolean;
}

export const MindmapElement = {
    hasLayout(value: MindmapElement, layout: MindmapLayoutType) {
        const _layout = MindmapQueries.getLayoutByElement(value);
        return _layout === layout;
    },
    isIndentedLayout(value: MindmapElement) {
        const _layout = MindmapQueries.getLayoutByElement(value) as MindmapLayoutType;
        return isIndentedLayout(_layout);
    }
};
