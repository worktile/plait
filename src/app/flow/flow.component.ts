import { Component, OnInit, Injector, HostBinding, ChangeDetectorRef } from '@angular/core';
import { BoardTransforms, PlaitBoardOptions, PlaitElement, Viewport } from '@plait/core';
import { withFlow } from '@plait/flow';
import { withCommon } from './plugins/with-common';
import { withDraw } from './plugins/with-draw';
import { CustomBoard } from './interfaces/board';
import { NgClass, NgFor } from '@angular/common';
import { mockBasicEdges, mockMarkEdges, mockIconEdges, mockShapeEdges } from './flow-edge-data';
import { mockBasicNodes, mockCustomNodes, mockCustomHandles, mockUndeletableNodes } from './flow-node-data';
import { mockFlowData } from './flow-data';
import { OnChangeData, PlaitBoardComponent } from '@plait/angular-board';

const LOCAL_DATA_KEY = 'plait-board-flow-change-data';

@Component({
    selector: 'app-basic-flow',
    templateUrl: './flow.component.html',
    standalone: true,
    imports: [PlaitBoardComponent, NgFor, NgClass]
})
export class BasicFlowComponent implements OnInit {
    @HostBinding('class') hostClass = 'app-flow';

    plugins = [withCommon, withFlow, withDraw];

    value: PlaitElement[] = mockFlowData;

    viewport!: Viewport;

    board!: CustomBoard;

    activeKey = 'default';

    options: PlaitBoardOptions = {
        readonly: false,
        hideScrollbar: false,
        disabledScrollOnNonFocus: false
    };

    menus = [
        {
            name: 'Nodes',
            children: [
                {
                    key: 'basicNodes',
                    name: 'Basic'
                },
                {
                    key: 'customNodes',
                    name: 'Custom Nodes'
                },
                {
                    key: 'customHandles',
                    name: 'Custom Handles'
                },
                {
                    key: 'undeletable',
                    name: 'Undeletable'
                }
            ]
        },
        {
            name: 'Edges',
            children: [
                {
                    key: 'basicEdge',
                    name: 'Basic'
                },
                {
                    key: 'edgeShape',
                    name: 'Edge Shape'
                },
                {
                    key: 'edgeMarks',
                    name: 'Edge Marks'
                },
                {
                    key: 'withIcon',
                    name: 'Width Icon'
                }
            ]
        }
    ];

    constructor(private injector: Injector, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.value = mockFlowData;
    }

    change(event: OnChangeData) {
        this.setLocalData(JSON.stringify(event));
    }

    setLocalData(data: string) {
        localStorage.setItem(`${LOCAL_DATA_KEY}`, data);
    }

    plaitBoardInitialized(value: CustomBoard) {
        this.board = value;
        this.board.injector = this.injector;
    }

    selectChange(key: string) {
        this.activeKey = key;
        switch (key) {
            case 'basicNodes':
                this.value = mockBasicNodes;
                break;
            case 'customNodes':
                this.value = mockCustomNodes;
                break;
            case 'customHandles':
                this.value = mockCustomHandles;
                break;
            case 'undeletable':
                this.value = mockUndeletableNodes;
                break;
            case 'basicEdge':
                this.value = mockBasicEdges;
                break;
            case 'edgeMarks':
                this.value = mockMarkEdges;
                break;
            case 'withIcon':
                this.value = mockIconEdges;
                break;
            case 'edgeShape':
                this.value = mockShapeEdges;
                break;
            default:
                this.value = mockFlowData;
                break;
        }

        setTimeout(() => {
            BoardTransforms.fitViewport(this.board);
        }, 0);
    }
}
