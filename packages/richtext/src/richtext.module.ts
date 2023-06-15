import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitRichtextComponent } from './richtext/richtext.component';
import { PlaitNodeComponent } from './node/node.component';
import { FormsModule } from '@angular/forms';
import { SlateModule } from 'slate-angular';

@NgModule({
    declarations: [PlaitRichtextComponent, PlaitNodeComponent],
    imports: [CommonModule, FormsModule, SlateModule],
    exports: [PlaitRichtextComponent, PlaitNodeComponent]
})
export class RichtextModule {}
