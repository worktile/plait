import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MindModule } from '@plait/mind';
import { FlowModule } from '@plait/flow';
import { PlaitModule } from '@plait/core';
import { TextModule } from '@plait/text';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicBoardEditorComponent } from './editor/editor.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicFlowComponent } from './flow/flow.component';
import { AppZoomToolbarComponent } from './components/zoom-toolbar/zoom-toolbar.component';
import { AppMainToolbarComponent } from './components/main-toolbar/main-toolbar.component';
import { AppSettingPanelComponent } from './components/setting-panel/setting-panel.component';
import { AppColorPickerComponent } from './components/color-picker/color-picker.component';
import { MindImageComponent } from './editor/image/image.component';
import { DrawModule } from 'packages/draw/src/draw.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppZoomToolbarComponent,
        AppMainToolbarComponent,
        AppSettingPanelComponent,
        AppComponent,
        BasicRichtextComponent,
        BasicFlowComponent,
        BasicBoardEditorComponent,
        AppColorPickerComponent,
        MindImageComponent
    ],
    imports: [BrowserModule, FormsModule, TextModule, AppRoutingModule, PlaitModule, FlowModule, MindModule, DrawModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
