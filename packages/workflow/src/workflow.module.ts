import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitModule } from '@plait/core';
import { WorkflowNodeComponent } from './node.component';
import { WorkflowTransitionComponent } from './transition.component';
import { WorkflowBaseComponent } from './workflow-base.component';

@NgModule({
    declarations: [WorkflowBaseComponent, WorkflowNodeComponent, WorkflowTransitionComponent],
    imports: [BrowserModule, PlaitModule],
    exports: []
})
export class WorkflowModule {}
