import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitModule } from '@plait/core';
import { FlowNodeComponent } from './flow-node.component';
import { FlowEdgeComponent } from './flow-edge.component';

@NgModule({
    declarations: [FlowNodeComponent, FlowEdgeComponent],
    imports: [BrowserModule, PlaitModule],
    exports: [FlowNodeComponent, FlowEdgeComponent]
})
export class FlowModule {}
