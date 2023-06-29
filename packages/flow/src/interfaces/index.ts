import { ComponentType, PlaitBoard } from '@plait/core';
import { FlowElement } from './element';
import { FlowEdgeLabelIconBaseComponent } from '../base/edge-label-icon-base.component';
import { LabelIconItem } from './icon';

export interface PlaitFlowBoard extends PlaitBoard {
    drawLabelIcon: (emoji: LabelIconItem, element: FlowElement) => ComponentType<FlowEdgeLabelIconBaseComponent>;
}
