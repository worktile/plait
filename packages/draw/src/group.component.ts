import { OnInit, OnDestroy, ViewContainerRef, ChangeDetectorRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { ActiveGenerator, CommonPluginElement } from '@plait/common';
import {
    OnContextChanged,
    PlaitBoard,
    PlaitPluginElementContext,
    getCommonElements,
    getElementsByGroup,
    getRectangleByGroup,
    getSelectedElements,
    isSelectionMoving
} from '@plait/core';
import { PlaitGroup } from './interfaces/group';
import { GroupGenerator } from './generators/group.generator';

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
        const selectedElements = getSelectedElements(this.board);
        const groupElements = getElementsByGroup(this.board, value.element, true);
       
        let isPartialSelected = false;
        if (groupElements.some(item => selectedElements.includes(item)) && !groupElements.every(item => selectedElements.includes(item))) {
            const commonElements = getCommonElements(this.board, selectedElements);
            if (commonElements.some(item => item.groupId === value.element.id)) {
                isPartialSelected = true;
            }
        }
        this.groupGenerator.processDrawing(value.element, this.g, isPartialSelected);
    }
}
