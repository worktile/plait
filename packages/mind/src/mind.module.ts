import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitModule } from '@plait/core';
import { RichtextModule } from '@plait/richtext';
import { MindNodeComponent } from './node.component';
import { PlaitMindComponent } from './mind.component';

@NgModule({
    declarations: [PlaitMindComponent, MindNodeComponent],
    imports: [BrowserModule, RichtextModule, PlaitModule],
    exports: [PlaitMindComponent, MindNodeComponent]
})
export class MindModule {}
