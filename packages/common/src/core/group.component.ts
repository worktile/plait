import {
    OnContextChanged,
    PlaitBoard,
    PlaitGroup,
    PlaitPluginElementContext,
    getElementsInGroup,
    getRectangleByGroup,
    isSelectedElementOrGroup,
    isSelectionMoving
} from '@plait/core';
import { GroupGenerator } from '../generators/group.generator';
import { ActiveGenerator } from '../generators';
import { CommonElementFlavour } from './element-flavour';
import { Subscription } from 'rxjs';

export class GroupComponent extends CommonElementFlavour<PlaitGroup, PlaitBoard> implements OnContextChanged<PlaitGroup, PlaitBoard> {
    onStableSubscription?: Subscription;

    constructor() {
        super();
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

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        const contextService = PlaitBoard.getBoardContext(this.board);
        this.onStableSubscription = contextService.onStable().subscribe(() => {
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

    destroy(): void {
        super.destroy();
        this.onStableSubscription?.unsubscribe();
    }
}
