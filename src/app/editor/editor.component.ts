import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import {
    BoardTransforms,
    PlaitBoard,
    PlaitBoardChangeEvent,
    PlaitBoardOptions,
    PlaitElement,
    PlaitTheme,
    ThemeColorMode,
    Viewport,
    copy,
    cut,
    getRectangleByElements,
    getSelectedElements,
    paste,
    setPlaitClipboardData,
    toPoint,
    transformPoint
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
import { withCommonPlugin } from '../plugins/with-common';
import { AppMenuComponent } from '../components/menu/menu.component';
const LOCAL_STORAGE_KEY = 'plait-board-data';

@Component({
    selector: 'app-basic-editor',
    templateUrl: './editor.component.html',
    standalone: true,
    imports: [
        PlaitBoardComponent,
        FormsModule,
        AppZoomToolbarComponent,
        AppMainToolbarComponent,
        AppSettingPanelComponent,
        AppMenuComponent
    ]
})
export class BasicEditorComponent implements OnInit {
    plugins = [withCommonPlugin, withMind, withMindExtend, withDraw];

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

    @ViewChild('contextMenu', { static: true, read: ElementRef })
    contextMenu!: ElementRef<any>;

    @HostListener('contextmenu', ['$event']) onContextmenu(event: MouseEvent) {
        if (!this.board.options.readonly) {
            event.preventDefault();
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseup(event: MouseEvent): void {
        this.contextMenu.nativeElement.style.display = 'none';
        if (event.button === 2 && !this.board.options.readonly) {
            this.openContextMenu(event);
        }
    }

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
                    this.value = [...mockDrawData];
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

    openContextMenu(e: MouseEvent) {
        this.contextMenu.nativeElement.style.display = 'block';
        this.contextMenu.nativeElement.style.left = `${e.clientX}px`;
        this.contextMenu.nativeElement.style.top = `${e.clientY}px`;
    }

    closeContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.contextMenu.nativeElement.style.display = 'none';
    }

    copy(event: MouseEvent) {
        event.stopPropagation();
        copy(this.board, event);
    }

    cut(event: MouseEvent) {
        event.stopPropagation();
        cut(this.board, event);
    }

    paste(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        const point = transformPoint(this.board, toPoint(event.x, event.y, PlaitBoard.getHost(this.board)));
        paste(this.board, event, point);
    }
}
