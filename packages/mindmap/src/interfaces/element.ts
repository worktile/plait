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
    borderColor?: string;
    borderWidth?: number;

    // link style attributes
    linkLineColor?: string;
    linkLinkWidth?: number;
    
    // topic
    fontSize?: number;
}
