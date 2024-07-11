import { Component, HostBinding, OnInit } from '@angular/core';
import {
    PlaitBoard,
    PlaitBoardOptions,
    PlaitTheme,
    Viewport,
    PlaitPlugin,
    PlaitOperation,
    Transforms,
    BoardTransforms,
    getSelectedElements
} from '@plait/core';
import { mockForceAtlasData } from './mock-force-atlas';
import { ForceAtlasElement, withForceAtlas } from '@plait/graph-viz';
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

    hasMoved = false;

    constructor(private activeRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.activeRoute.queryParams.subscribe((params: Params) => {
            const init = params['init'];
            switch (init) {
                case 'force-atlas':
                    this.value = mockForceAtlasData;
                    break;
                default:
                    this.value = [];
                    break;
            }
        });
    }

    onChange(event: OnChangeData) {
        const selectElements = getSelectedElements(this.board);
        const selectElement = selectElements[0];
        const isSetViewport = event.operations.length && event.operations.every(op => PlaitOperation.isSetViewportOperation(op));
        const isSetSelection = event.operations.length && event.operations.every(op => PlaitOperation.isSetSelectionOperation(op));
        if (isSetViewport) {
            this.hasMoved = true;
        }
        if (isSetSelection && this.hasMoved && selectElement) {
            BoardTransforms.moveToCenter(this.board, selectElement.points![0]);
        }
    }
}
