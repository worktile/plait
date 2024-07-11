import { CommonElementFlavour } from '@plait/common';
import { OnContextChanged, PlaitBoard, PlaitPluginElementContext, cacheSelectedElements } from '@plait/core';
import Graph from 'graphology';
import circular from 'graphology-layout/circular';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { ForceAtlasElement, ForceAtlasNodeElement } from '../interfaces';
import { DEFAULT_NODE_SCALING_RATIO, DEFAULT_NODE_SIZE } from './constants';
import { moveBoardViewportToCenter } from './utils/node';

export class ForceAtlasFlavour extends CommonElementFlavour<ForceAtlasElement, PlaitBoard>
    implements OnContextChanged<ForceAtlasElement, PlaitBoard> {
    graph!: Graph<ForceAtlasNodeElement>;

    constructor() {
        super();
    }

    initializeGraph() {
        this.graph = new Graph<ForceAtlasNodeElement>();
        this.element.children?.forEach(child => {
            if (ForceAtlasElement.isForceAtlasNodeElement(child)) {
                if (typeof child?.size === 'undefined') {
                    child.size = DEFAULT_NODE_SIZE;
                }
                if (child.isActive) {
                    cacheSelectedElements(this.board, [child]);
                }
                this.graph.addNode(child.id, child);
            } else if (ForceAtlasElement.isForceAtlasEdgeElement(child)) {
                this.graph.addEdge(child.source, child.target);
            }
        });
        circular.assign(this.graph);
        const settings = forceAtlas2.inferSettings(this.graph);
        settings.strongGravityMode = false;
        settings.linLogMode = true;
        settings.gravity = 2;
        settings.adjustSizes = true;
        settings.scalingRatio = DEFAULT_NODE_SCALING_RATIO;
        const positions = forceAtlas2(this.graph, { iterations: 1000, settings });
        this.element.children?.forEach(child => {
            if (ForceAtlasElement.isForceAtlasNodeElement(child)) {
                const pos = positions[child.id];
                child.points = [[pos.x, pos.y]];
            }
        });
    }

    initialize(): void {
        super.initialize();
        this.initializeGraph();
        setTimeout(() => {
            moveBoardViewportToCenter(this.board);
        }, 0);
    }

    onContextChanged(
        value: PlaitPluginElementContext<ForceAtlasElement, PlaitBoard>,
        previous: PlaitPluginElementContext<ForceAtlasElement, PlaitBoard>
    ) {}

    updateText(previousElement: ForceAtlasElement, currentElement: ForceAtlasElement) {}

    destroy(): void {
        super.destroy();
    }
}
