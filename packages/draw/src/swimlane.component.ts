import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaitSwimlane } from './interfaces';
import { TableComponent } from './table.component';

@Component({
    selector: 'plait-draw-swimlane',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class SwimlaneComponent extends TableComponent<PlaitSwimlane> {
    constructor() {
        super();
    }
}
