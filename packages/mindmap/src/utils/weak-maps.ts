import { PlaitMindmap } from '../interfaces/mindmap';
import { MindmapNodeComponent } from '../node.component';
import { PlaitBoard } from '@plait/core';
import { MindmapElement } from '../interfaces/element';

export const ELEMENT_GROUP_TO_COMPONENT: WeakMap<SVGGElement, MindmapNodeComponent> = new WeakMap();

export const MINDMAP_ELEMENT_TO_COMPONENT: WeakMap<MindmapElement, MindmapNodeComponent> = new WeakMap();

export const SELECTED_MINDMAP_ELEMENTS: WeakMap<PlaitBoard, MindmapElement[]> = new WeakMap();
