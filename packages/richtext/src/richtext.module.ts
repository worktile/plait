import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitRichtextComponent } from './richtext/richtext.component';
import { PlaitNodeComponent } from './node/node.component';

@NgModule({
    declarations: [PlaitRichtextComponent, PlaitNodeComponent],
    imports: [CommonModule],
    exports: [PlaitRichtextComponent, PlaitNodeComponent]
})
export class RichtextModule {}
