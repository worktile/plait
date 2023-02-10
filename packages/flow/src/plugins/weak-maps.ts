import { FlowElement } from '../interfaces';
import { FlowBaseComponent } from '../flow-base.component';
import { PlaitBoard } from '@plait/core';

export const FLOW_ELEMENT_TO_COMPONENT: WeakMap<FlowElement, FlowBaseComponent> = new WeakMap();

export const FLOW_ACTIVE_ELEMENT: WeakMap<PlaitBoard, FlowElement | null> = new WeakMap();
