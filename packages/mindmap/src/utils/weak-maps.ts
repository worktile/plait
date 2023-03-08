import { MindmapNodeComponent } from '../node.component';
import { MindmapNodeElement } from '../interfaces/element';

export const ELEMENT_GROUP_TO_COMPONENT: WeakMap<SVGGElement, MindmapNodeComponent> = new WeakMap();

export const MINDMAP_ELEMENT_TO_COMPONENT: WeakMap<MindmapNodeElement, MindmapNodeComponent> = new WeakMap();
