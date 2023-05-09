import { MindNodeComponent } from '../node.component';
import { MindElement } from '../interfaces/element';
import { MindNode } from '../interfaces/node';

export const MIND_ELEMENT_TO_COMPONENT: WeakMap<MindElement, MindNodeComponent> = new WeakMap();

export const ELEMENT_TO_NODE = new WeakMap<MindElement, MindNode>();
