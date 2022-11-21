import { WorkflowElement } from '../interfaces';
import { WorkflowBaseComponent } from '../workflow-base.component';
import { PlaitBoard } from '@plait/core';

export const WORKFLOW_ELEMENT_TO_COMPONENT: WeakMap<WorkflowElement, WorkflowBaseComponent> = new WeakMap();

export const WORKFLOW_ACTIVE_ELEMENT: WeakMap<PlaitBoard, WorkflowElement | null> = new WeakMap();
