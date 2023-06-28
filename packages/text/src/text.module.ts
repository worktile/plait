import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitRichtextComponent } from './richtext/richtext.component';
import { FormsModule } from '@angular/forms';
import { SlateModule } from 'slate-angular';
import { PlaitTextNodeComponent } from './text-node/text.component';
import { PlaitLinkNodeComponent } from './plugins/link/link.component';

@NgModule({
    declarations: [PlaitRichtextComponent, PlaitTextNodeComponent, PlaitLinkNodeComponent],
    imports: [CommonModule, FormsModule, SlateModule],
    exports: [PlaitRichtextComponent]
})
export class TextModule {}
