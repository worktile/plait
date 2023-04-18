import { MindmapNodeComponent } from '../node.component';
import { MindmapNodeElement } from '../interfaces/element';
import { MindmapNode } from '../interfaces/node';

export const ELEMENT_GROUP_TO_COMPONENT: WeakMap<SVGGElement, MindmapNodeComponent> = new WeakMap();

export const ELEMENT_TO_NODE = new WeakMap<MindmapNodeElement, MindmapNode>();
