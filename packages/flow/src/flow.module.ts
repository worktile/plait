import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitModule } from '@plait/core';
import { FlowNodeComponent } from './flow-node.component';
import { FlowEdgeComponent } from './flow-edge.component';

@NgModule({
    declarations: [FlowNodeComponent, FlowEdgeComponent],
    imports: [CommonModule, PlaitModule],
    exports: [FlowNodeComponent, FlowEdgeComponent]
})
export class FlowModule {}
