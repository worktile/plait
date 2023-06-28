import { ComponentType, PlaitBoard } from '@plait/core';
import { FlowElement } from './element';
import { FlowIconBaseComponent } from '../base/icon-base.component';
import { IconItem } from './icon';

export interface PlaitFlowBoard extends PlaitBoard {
    drawIcon: (emoji: IconItem, element: FlowElement) => ComponentType<FlowIconBaseComponent>;
}
