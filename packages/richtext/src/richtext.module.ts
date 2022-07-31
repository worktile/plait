import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitRichtextComponent } from './richtext/richtext.component';
import { PlaitNodeComponent } from './node/node.component';

@NgModule({
    declarations: [PlaitRichtextComponent, PlaitNodeComponent],
    imports: [BrowserModule],
    exports: [PlaitRichtextComponent, PlaitNodeComponent]
})
export class RichtextModule {}
