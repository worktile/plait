import { Component, HostBinding, OnInit } from '@angular/core';
import {
    PlaitBoard,
    PlaitBoardOptions,
    PlaitTheme,
    Viewport,
    PlaitPlugin,
    PlaitOperation,
    BoardTransforms,
    getSelectedElements,
    toViewBoxPoint,
    toHostPoint,
    getHitElementsByPoint,
    temporaryDisableSelection,
    PlaitOptionsBoard,
    PlaitPluginKey,
    WithSelectionPluginOptions,
    PlaitElement
} from '@plait/core';
import { mockForceAtlasData } from './mock-force-atlas';
import { ForceAtlasElement, ForceAtlasNodeElement, withForceAtlas } from '@plait/graph-viz';
import { AppSettingPanelComponent } from '../components/setting-panel/setting-panel.component';
import { AppMainToolbarComponent } from '../components/main-toolbar/main-toolbar.component';
import { AppZoomToolbarComponent } from '../components/zoom-toolbar/zoom-toolbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { withCommonPlugin } from '../plugins/with-common';
import { AppMenuComponent } from '../components/menu/menu.component';
import { NgIf } from '@angular/common';
import { OnChangeData, PlaitBoardComponent } from '@plait/angular-board';
import { withForceAtlasExtend } from './with-force-atlas-extend';
import { DebugPointDisplayComponent } from '../components/debug/point-display.component';

@Component({
    selector: 'app-basic-graph-viz',
    templateUrl: './graph-viz.component.html',
    standalone: true,
    imports: [
        PlaitBoardComponent,
        FormsModule,
        AppZoomToolbarComponent,
        AppMainToolbarComponent,
        AppSettingPanelComponent,
        AppMenuComponent,
        DebugPointDisplayComponent,
        NgIf
    ]
})
export class BasicGraphVizComponent implements OnInit {
    @HostBinding('class') hostClass = 'app-graph-viz';

    plugins: PlaitPlugin[] = [withCommonPlugin, withForceAtlas, withForceAtlasExtend];

    value: ForceAtlasElement[] = [];

    options: PlaitBoardOptions = {
        readonly: false,
        hideScrollbar: true,
        disabledScrollOnNonFocus: false
    };

    viewport!: Viewport;

    theme!: PlaitTheme;

    board!: PlaitBoard;

    hasViewportMoved = false;

    currentNodeId: null | string = null;

    constructor(private activeRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.activeRoute.queryParams.subscribe((params: Params) => {
            const init = params['init'];
            switch (init) {
                case 'force-atlas':
                    this.fetchForceAtlasData();
                    break;
                default:
                    this.value = [];
                    break;
            }
        });
    }

    fetchForceAtlasData() {
        setTimeout(() => {
            this.value = mockForceAtlasData;
            setTimeout(() => {
                const selectedElement = getSelectedElements(this.board)[0];
                if (selectedElement) {
                    this.moveBoardToCenter(selectedElement);
                }
            }, 0);
        }, 1000);
    }

    onChange(event: OnChangeData) {
        const selectedElements = getSelectedElements(this.board);
        const selectedElement = selectedElements[0];
        const isSetViewport = event.operations.length && event.operations.every(op => PlaitOperation.isSetViewportOperation(op));
        if (isSetViewport) {
            this.hasViewportMoved = true;
        }
        if (selectedElement) {
            this.currentNodeId = selectedElement.id;
        }
    }

    afterBoardInitialized(board: PlaitBoard) {
        this.board = board;
        const { pointerUp } = board;

        let timeoutId: any = null;
        let clickCount: number = 0;

        // simulate db click event and prevent pointerUp event when trigger db click
        board.pointerUp = e => {
            console.log('anyway up');
            // prevent set_selection in pointerUp when viewport is moving
            if (PlaitBoard.getBoardContainer(board).classList.contains('viewport-moving')) {
                return;
            }
            clickCount = clickCount + 1;
            if (clickCount >= 2) {
                console.log('trigger db click');
                const targetNodeElement = getHitForceAtlasNode(board, e);
                if (targetNodeElement) {
                    console.log(`hit target: ${targetNodeElement.label}`);
                }
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                clickCount = 0;
                return;
            }
            timeoutId = setTimeout(() => {
                clickCount = 0;
                const targetNodeElement = getHitForceAtlasNode(board, e);
                if (targetNodeElement) {
                    if (this.hasViewportMoved || (!this.hasViewportMoved && this.currentNodeId !== targetNodeElement.id)) {
                        console.log('move to center');
                        this.moveBoardToCenter(targetNodeElement);
                        // to wait moving completing and mark viewport as unmoved
                        setTimeout(() => {
                            this.hasViewportMoved = false;
                        }, 0);
                    }
                }
                timeoutId = null;
                console.log('trigger up');
                pointerUp(e);
            }, 250);
        };
    }

    moveBoardToCenter(selectedElement: PlaitElement) {
        if (selectedElement && selectedElement.points) {
            setTimeout(() => {
                BoardTransforms.moveToCenter(this.board, selectedElement.points![0]);
                setTimeout(() => {
                    this.hasViewportMoved = false;
                }, 0);
            }, 0);
        }
    }
}

export const getHitForceAtlasNode = (board: PlaitBoard, e: PointerEvent) => {
    const point = toViewBoxPoint(board, toHostPoint(board, e.x, e.y));
    const hitElements = getHitElementsByPoint(board, point);
    if (hitElements.length > 0 && ForceAtlasElement.isForceAtlasNodeElement(hitElements[0])) {
        return hitElements[0];
    }
    return null;
};
