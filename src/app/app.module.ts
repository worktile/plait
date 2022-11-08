import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MindmapModule } from '@plait/mindmap';
import { WorkflowModule } from '@plait/workflow';
import { PlaitModule } from '@plait/core';
import { RichtextModule } from '@plait/richtext';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicBoardComponent } from './board/board.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicWorkflowComponent } from './workflow/workflow.component';

@NgModule({
    declarations: [AppComponent, BasicRichtextComponent, BasicBoardComponent, BasicWorkflowComponent],
    imports: [BrowserModule, RichtextModule, AppRoutingModule, PlaitModule, MindmapModule, WorkflowModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
