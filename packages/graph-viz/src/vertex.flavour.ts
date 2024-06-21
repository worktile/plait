import { CommonElementFlavour } from "@plait/common";
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext } from "@plait/core";
import { PlaitCommonGeometry } from "@plait/draw";

export class VertexFlavour extends CommonElementFlavour<PlaitCommonGeometry, PlaitBoard>
    implements OnContextChanged<PlaitCommonGeometry, PlaitBoard> {

    // shapeGenerator!: GeometryShapeGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        // this.shapeGenerator = new GeometryShapeGenerator(this.board);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        // this.getElementG();
        // this.shapeGenerator.processDrawing(this.element as PlaitGeometry, this.getElementG());
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitCommonGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitCommonGeometry, PlaitBoard>
    ) {
        
    }

    updateText(previousElement: PlaitCommonGeometry, currentElement: PlaitCommonGeometry) {
        
    }

    destroy(): void {
        super.destroy();
    }
}