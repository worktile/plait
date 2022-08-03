import { Element } from 'slate';

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

    // link style attributes
    linkLineColor?: string;
    linkLineWidth?: number;
    
    // topic
    fontSize?: number;
    color?: string;

    isCollapsed?: boolean;
}
