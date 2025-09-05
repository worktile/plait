import { OnContextChanged, PlaitBoard, PlaitGroup, PlaitPluginElementContext, getRectangleByGroup, isSelectionMoving } from '@plait/core';
import { GroupGenerator } from '../generators/group.generator';
import { ActiveGenerator, createActiveGenerator } from '../generators';
import { CommonElementFlavour } from './element-flavour';

export class GroupComponent extends CommonElementFlavour<PlaitGroup, PlaitBoard> implements OnContextChanged<PlaitGroup, PlaitBoard> {
    constructor() {
        super();
    }

    activeGenerator!: ActiveGenerator<PlaitGroup>;

    groupGenerator!: GroupGenerator;

    initializeGenerator() {
        this.activeGenerator = createActiveGenerator<PlaitGroup>(this.board, {
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
        this.getRef().addGenerator(GroupGenerator.key, this.groupGenerator);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitGroup, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitGroup, PlaitBoard>
    ) {}
}
