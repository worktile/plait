import { Element } from 'slate';
import { MindmapNodeShape } from '../constants/node';

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

    isCollapsed?: boolean;
}

export const MindmapElement = {
    hasRoundRectangleShape(value: MindmapElement) {
        return value.shape === MindmapNodeShape.roundRectangle || value.shape === undefined || value.shape === null;
    },
    hasUnderlineShape(value: MindmapElement) {
        return value.shape === MindmapNodeShape.underline;
    }
};
