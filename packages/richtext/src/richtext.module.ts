import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitRichtextComponent } from './richtext/richtext.component';
import { PlaitTextComponent } from './text/text.component';

@NgModule({
    declarations: [PlaitRichtextComponent, PlaitTextComponent],
    imports: [BrowserModule],
    exports: [PlaitRichtextComponent, PlaitTextComponent]
})
export class RichtextModule {}
