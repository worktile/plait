import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitModule } from '@plait/core';
import { TextModule } from '@plait/text';
import { MindNodeComponent } from './mind-node.component';
import { PlaitMindComponent } from './mind.component';

@NgModule({
    declarations: [PlaitMindComponent, MindNodeComponent],
    imports: [CommonModule, TextModule, PlaitModule],
    exports: [PlaitMindComponent, MindNodeComponent]
})
export class MindModule {}
