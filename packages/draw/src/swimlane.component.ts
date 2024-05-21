import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import { TableComponent } from './table.component';
import { PlaitSwimlane } from './interfaces';
import { buildSwimlane } from './utils/swimlane';

export class SwimlaneComponent extends TableComponent<PlaitSwimlane> implements OnContextChanged<PlaitSwimlane, PlaitBoard> {
    swimlaneElement!: PlaitSwimlane;

    initialize(): void {
        this.swimlaneElement = buildSwimlane({ ...this.element });
        super.initialize(this.swimlaneElement);
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitSwimlane, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitSwimlane, PlaitBoard>
    ) {
        this.swimlaneElement = buildSwimlane({ ...value.element });
        super.onContextChanged(
            {
                ...value,
                element: this.swimlaneElement
            },
            previous
        );
    }

    destroy(): void {
        super.destroy();
    }
}
