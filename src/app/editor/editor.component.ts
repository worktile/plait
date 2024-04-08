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
    getClipboardData,
    getProbablySupportsClipboardWrite,
    getRectangleByElements,
    getSelectedElements,
    toHostPoint,
    toViewBoxPoint,
    getHighestSelectedGroups,
    canRemoveGroup,
    canAddGroup,
    getHighestSelectedElements,
    GroupTransforms,
    deleteFragment
} from '@plait/core';
import { mockDrawData, mockGroupData, mockMindData, mockRotateData } from './mock-data';
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
import { moveDown, moveUp } from '@plait/common';
import { withGroup } from '@plait/common';

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
    plugins = [withCommonPlugin, withMind, withMindExtend, withDraw, withGroup];

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

    showAddGroup!: boolean;

    showRemoveGroup!: boolean;

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
                case 'rotate':
                    this.value = [...mockRotateData];
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
        this.showRemoveGroup = canRemoveGroup(this.board);
        this.showAddGroup = canAddGroup(this.board);
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

    moveUp(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        moveUp(this.board);
    }

    moveDown(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        moveDown(this.board);
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
        deleteFragment(this.board);
    }

    addGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        GroupTransforms.addGroup(this.board);
    }

    removeGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        GroupTransforms.removeGroup(this.board);
    }

    async paste(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        const targetPoint = toViewBoxPoint(this.board, toHostPoint(this.board, event.x, event.y));
        const clipboardData = await getClipboardData(null);
        this.board.insertFragment(null, clipboardData, targetPoint);
    }
}

export const arrayToMap = <T extends { id: string } | string>(items: readonly T[]) => {
    return items.reduce((acc: Map<string, T>, element) => {
        acc.set(typeof element === 'string' ? element : element.id, element);
        return acc;
    }, new Map());
};
