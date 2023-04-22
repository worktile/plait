import { MindmapNodeComponent } from '../node.component';
import { MindmapNodeElement } from '../interfaces/element';
import { MindmapNode } from '../interfaces/node';

export const MINDMAP_ELEMENT_TO_COMPONENT: WeakMap<MindmapNodeElement, MindmapNodeComponent> = new WeakMap();

export const ELEMENT_TO_NODE = new WeakMap<MindmapNodeElement, MindmapNode>();
