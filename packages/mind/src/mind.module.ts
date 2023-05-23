import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitModule } from '@plait/core';
import { RichtextModule } from '@plait/richtext';
import { MindNodeComponent } from './node.component';
import { PlaitMindComponent } from './mind.component';

@NgModule({
    declarations: [PlaitMindComponent, MindNodeComponent],
    imports: [CommonModule, RichtextModule, PlaitModule],
    exports: [PlaitMindComponent, MindNodeComponent]
})
export class MindModule {}
