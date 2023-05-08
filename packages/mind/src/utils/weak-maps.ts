import { MindNodeComponent } from '../node.component';
import { MindElement } from '../interfaces/element';
import { MindmapNode } from '../interfaces/node';

export const MINDMAP_ELEMENT_TO_COMPONENT: WeakMap<MindElement, MindNodeComponent> = new WeakMap();

export const ELEMENT_TO_NODE = new WeakMap<MindElement, MindmapNode>();
