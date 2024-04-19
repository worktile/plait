import { OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    OnContextChanged,
    PlaitBoard,
    PlaitContextService,
    PlaitGroup,
    PlaitPluginElementContext,
    getElementsInGroup,
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
    contextService = inject(PlaitContextService);

    constructor(protected cdr: ChangeDetectorRef, private destroyRef: DestroyRef) {
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
        this.contextService
            .onStable()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const elementsInGroup = getElementsInGroup(this.board, this.element, false, true);
                const isPartialSelectGroup =
                    elementsInGroup.some(item => isSelectedElementOrGroup(this.board, item)) &&
                    !elementsInGroup.every(item => isSelectedElementOrGroup(this.board, item));
                this.groupGenerator.processDrawing(this.element, this.getElementG(), isPartialSelectGroup);
            });
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitGroup, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitGroup, PlaitBoard>
    ) {}
}
