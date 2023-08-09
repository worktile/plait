import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitModule } from '@plait/core';
import { TextModule } from '@plait/text';
import { GeometryComponent } from './geometry.component';
import { LineComponent } from './line.component';

@NgModule({
    declarations: [GeometryComponent, LineComponent],
    imports: [CommonModule, TextModule, PlaitModule],
    exports: [GeometryComponent, LineComponent]
})
export class DrawModule {}
