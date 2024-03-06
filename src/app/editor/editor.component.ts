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
    addGroup,
    getClipboardData,
    getProbablySupportsClipboardWrite,
    getRectangleByElements,
    getSelectedElements,
    isSelectGroup,
    isPartialSelectGroup,
    removeGroup,
    toHostPoint,
    toViewBoxPoint,
    getSelectedGroupsAndElements
} from '@plait/core';
import { mockDrawData, mockGroupData, mockMindData } from './mock-data';
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
import { NgIf } from '@angular/common';
import { mockTurningPointData } from './mock-turning-point-data';
import { PlaitGroupElement } from 'packages/core/src/interfaces';

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
        AppMenuComponent,
        NgIf
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

    showPaste = getProbablySupportsClipboardWrite();

    selectedElements: PlaitElement[] = [];

    isSelectGroup!: boolean;

    get showaddGroup() {
        if (this.selectedElements.length <= 1) {
            return false;
        }
        const selectedGroupsAndElements = getSelectedGroupsAndElements(this.board);
        return (
            !isPartialSelectGroup(this.board) &&
            !(selectedGroupsAndElements.length === 1 && PlaitGroupElement.isGroup(selectedGroupsAndElements[0]))
        );
    }

    @ViewChild('contextMenu', { static: true, read: ElementRef })
    contextMenu!: ElementRef<any>;

    @HostListener('contextmenu', ['$event']) onContextmenu(event: MouseEvent) {
        if (!this.board.options.readonly) {
            event?.preventDefault();
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseup(event: MouseEvent): void {
        this.contextMenu.nativeElement.style.display = 'none';
        if (event.button === 2 && !this.board.options.readonly) {
            this.contextMenu.nativeElement.style.display = 'block';
            this.contextMenu.nativeElement.style.left = `${event.clientX}px`;
            this.contextMenu.nativeElement.style.top = `${event.clientY}px`;
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
                case 'turning-point':
                    this.value = [...mockTurningPointData];
                    break;
                case 'group':
                    this.value = [...mockGroupData];
                    break;
                default:
                    this.value = [...mockDrawData];
                    break;
            }
        });
    }

    change(event: PlaitBoardChangeEvent) {
        this.setLocalData(JSON.stringify(event));
        this.selectedElements = getSelectedElements(this.board);
        this.isSelectGroup = isSelectGroup(this.board);
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

    copy(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        const rectangle = getRectangleByElements(this.board, this.selectedElements, false);
        this.board.setFragment(null, null, rectangle, 'copy');
    }

    cut(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        const rectangle = getRectangleByElements(this.board, this.selectedElements, false);
        this.board.setFragment(null, null, rectangle, 'cut');
        this.board.deleteFragment(null);
    }

    addGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        addGroup(this.board);
    }

    removeGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        removeGroup(this.board);
    }

    async paste(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        const targetPoint = toViewBoxPoint(this.board, toHostPoint(this.board, event.x, event.y));
        const clipboardData = await getClipboardData(null);
        this.board.insertFragment(null, clipboardData, targetPoint);
    }
}
