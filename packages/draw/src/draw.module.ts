import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitModule } from '@plait/core';
import { TextModule } from '@plait/text';
import { GeoComponent } from './geo.component';

@NgModule({
    declarations: [GeoComponent],
    imports: [CommonModule, TextModule, PlaitModule],
    exports: [GeoComponent]
})
export class DrawModule {}
