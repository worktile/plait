import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitModule } from '@plait/core';
import { PlaitWorkflowComponent } from './workflow.component';

@NgModule({
    declarations: [PlaitWorkflowComponent],
    imports: [BrowserModule, PlaitModule],
    exports: [PlaitWorkflowComponent]
})
export class WorkflowModule {}
