import { Component, OnInit } from '@angular/core';
import {
    BoardTransforms,
    PlaitBoard,
    PlaitBoardChangeEvent,
    PlaitBoardOptions,
    PlaitElement,
    PlaitTheme,
    ThemeColorMode,
    Viewport
} from '@plait/core';
import { mockDrawData, mockMindData } from './mock-data';
import { withMind, PlaitMindBoard, PlaitMind } from '@plait/mind';
import { AbstractResizeState, MindThemeColors } from '@plait/mind';
import { withMindExtend } from '../plugins/with-mind-extend';
import { PlaitGeometry, withDraw } from '@plait/draw';
import { AppSettingPanelComponent } from '../components/setting-panel/setting-panel.component';
import { AppMainToolbarComponent } from '../components/main-toolbar/main-toolbar.component';
import { AppZoomToolbarComponent } from '../components/zoom-toolbar/zoom-toolbar.component';
import { FormsModule } from '@angular/forms';
import { PlaitBoardComponent } from '../../../packages/core/src/board/board.component';
import { ActivatedRoute, Params } from '@angular/router';
import { mockLineData, withLineRoute } from '../plugins/with-line-route';

const LOCAL_STORAGE_KEY = 'plait-board-data';

@Component({
    selector: 'app-basic-editor',
    templateUrl: './editor.component.html',
    standalone: true,
    imports: [PlaitBoardComponent, FormsModule, AppZoomToolbarComponent, AppMainToolbarComponent, AppSettingPanelComponent]
})
export class BasicEditorComponent implements OnInit {
    plugins = [withMind, withMindExtend, withDraw];

    value: (PlaitElement | PlaitGeometry | PlaitMind)[] = [];

    options: PlaitBoardOptions = {
        readonly: false,
        hideScrollbar: false,
        disabledScrollOnNonFocus: false,
        themeColors: MindThemeColors
    };

    viewport!: Viewport;

    theme!: PlaitTheme;

    board!: PlaitBoard;

    constructor(private activeRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.activeRoute.queryParams.subscribe((params: Params) => {
            const init = params['init'];
            switch (init) {
                case 'mind':
                    this.value = [...mockMindData];
                    break;
                case 'draw':
                    this.value = [...mockDrawData];
                    break;
                case 'local-storage':
                    const data = this.getLocalStorage();
                    if (data) {
                        this.value = data.children;
                        this.viewport = data.viewport;
                        this.theme = data.theme;
                    }
                    break;
                case 'empty':
                    this.value = [];
                    break;
                case 'route':
                    this.value = [...mockLineData];
                    this.plugins.push(withLineRoute);
                    break;
                default:
                    this.value = [];
                    break;
            }
        });
    }

    change(event: PlaitBoardChangeEvent) {
        this.setLocalData(JSON.stringify(event));
    }

    getLocalStorage() {
        const data = localStorage.getItem(`${LOCAL_STORAGE_KEY}`);
        return data ? JSON.parse(data) : null;
    }

    setLocalData(data: string) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}`, data);
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
        (this.board as PlaitMindBoard).onAbstractResize = (state: AbstractResizeState) => {};
    }

    themeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        BoardTransforms.updateThemeColor(this.board, value as ThemeColorMode);
    }
}
