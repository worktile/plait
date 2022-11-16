import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitModule } from '@plait/core';
import { WorkflowNodeComponent } from './node.component';
import { WorkflowTransitionComponent } from './transition.component';

@NgModule({
    declarations: [WorkflowNodeComponent, WorkflowTransitionComponent],
    imports: [BrowserModule, PlaitModule],
    exports: [WorkflowNodeComponent, WorkflowTransitionComponent]
})
export class WorkflowModule {}
