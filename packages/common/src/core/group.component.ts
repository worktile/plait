import { OnInit, OnDestroy, ViewContainerRef, ChangeDetectorRef, ChangeDetectionStrategy, Component } from '@angular/core';
import {
    OnContextChanged,
    PlaitBoard,
    PlaitGroup,
    PlaitPluginElementContext,
    getAllowedElementsInGroup,
    getRectangleByGroup,
    isSelectedElementOrGroup,
    isSelectionMoving
} from '@plait/core';
import { GroupGenerator } from '../generators/group.generator';
import { ActiveGenerator } from '../generators';
import { CommonPluginElement } from './plugin-element';

@Component({
    selector: 'plait-group',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class GroupComponent extends CommonPluginElement<PlaitGroup, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitGroup, PlaitBoard> {
    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    activeGenerator!: ActiveGenerator<PlaitGroup>;

    groupGenerator!: GroupGenerator;

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<PlaitGroup>(this.board, {
            getRectangle: (element: PlaitGroup) => {
                return getRectangleByGroup(this.board, element);
            },
            getStrokeWidth: () => 0,
            getStrokeOpacity: () => 0,
            hasResizeHandle: () => {
                return !isSelectionMoving(this.board);
            }
        });
        this.groupGenerator = new GroupGenerator(this.board);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitGroup, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitGroup, PlaitBoard>
    ) {
        const elementsInGroup = getAllowedElementsInGroup(this.board, value.element, false, true);
        const isPartialSelectGroup =
            elementsInGroup.some(item => isSelectedElementOrGroup(this.board, item)) &&
            !elementsInGroup.every(item => isSelectedElementOrGroup(this.board, item));
        this.groupGenerator.processDrawing(value.element, this.g, isPartialSelectGroup);
    }
}
