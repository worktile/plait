import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MindmapModule } from '@plait/mindmap';
import { FlowModule } from '@plait/flow';
import { PlaitModule } from '@plait/core';
import { RichtextModule } from '@plait/richtext';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicBoardComponent } from './board/board.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicFlowComponent } from './flow/flow.component';

@NgModule({
    declarations: [AppComponent, BasicRichtextComponent, BasicBoardComponent, BasicFlowComponent],
    imports: [BrowserModule, RichtextModule, AppRoutingModule, PlaitModule, MindmapModule, FlowModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
