import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, ACTIVE_STROKE_WIDTH, RectangleClient } from '@plait/core';
import { ActiveGenerator, canResize, CommonPluginElement } from '@plait/common';
import { PlaitTable } from './interfaces/table';

@Component({
    selector: 'plait-draw-table',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class TableComponent extends CommonPluginElement<PlaitTable, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitTable, PlaitBoard> {
    activeGenerator!: ActiveGenerator<PlaitTable>;

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<PlaitTable>(this.board, {
            getStrokeWidth: () => {
                return ACTIVE_STROKE_WIDTH;
            },
            getStrokeOpacity: () => {
                return 1;
            },
            getRectangle: (element: PlaitTable) => {
                return RectangleClient.getRectangleByPoints(element.points);
            },
            hasResizeHandle: () => {
                return canResize(this.board, this.element);
            }
        });
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitTable, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitTable, PlaitBoard>
    ) {}

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
