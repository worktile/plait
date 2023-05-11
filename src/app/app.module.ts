import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MindModule } from '@plait/mind';
import { FlowModule } from '@plait/flow';
import { PlaitModule } from '@plait/core';
import { RichtextModule } from '@plait/richtext';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicBoardEditorComponent } from './editor/editor.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicFlowComponent } from './flow/flow.component';
import { ThyDialogModule } from 'ngx-tethys/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [AppComponent, BasicRichtextComponent, BasicFlowComponent, BasicBoardEditorComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RichtextModule,
        AppRoutingModule,
        PlaitModule,
        FlowModule,
        MindModule,
        ThyDialogModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
