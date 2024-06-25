import { Component, OnInit } from '@angular/core';
import { PlaitBoard, PlaitBoardOptions, PlaitTheme, Viewport, PlaitPlugin } from '@plait/core';
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
import { PlaitBoardComponent } from '@plait/angular-board';

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
    plugins: PlaitPlugin[] = [withCommonPlugin, withForceAtlas];

    value: ForceAtlasElement[] = [];

    options: PlaitBoardOptions = {
        readonly: true,
        hideScrollbar: true,
        disabledScrollOnNonFocus: false
    };

    viewport!: Viewport;

    theme!: PlaitTheme;

    board!: PlaitBoard;

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
}
