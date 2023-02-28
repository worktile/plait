import { MindmapNodeComponent } from '../node.component';
import { PlaitBoard } from '@plait/core';
import { MindmapNodeElement } from '../interfaces/element';

export const ELEMENT_GROUP_TO_COMPONENT: WeakMap<SVGGElement, MindmapNodeComponent> = new WeakMap();

export const MINDMAP_ELEMENT_TO_COMPONENT: WeakMap<MindmapNodeElement, MindmapNodeComponent> = new WeakMap();

export const SELECTED_MINDMAP_ELEMENTS: WeakMap<PlaitBoard, MindmapNodeElement[]> = new WeakMap();
