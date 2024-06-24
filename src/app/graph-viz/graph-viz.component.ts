import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import {
    BoardTransforms,
    PlaitBoard,
    PlaitBoardOptions,
    PlaitElement,
    PlaitTheme,
    ThemeColorMode,
    Viewport,
    getClipboardData,
    getProbablySupportsClipboardWrite,
    getSelectedElements,
    toHostPoint,
    toViewBoxPoint,
    canRemoveGroup,
    canAddGroup,
    deleteFragment,
    Transforms,
    duplicateElements,
    setFragment,
    WritableClipboardOperationType,
    PlaitPlugin
} from '@plait/core';
import { mockKnowledgeGraphData } from './mock-knowledge-graph';
import { KnowledgeGraphElement, withKnowledgeGraph } from '@plait/graph-viz';
import { AbstractResizeState, MindThemeColors } from '@plait/mind';
import { PlaitGeometry, withDraw } from '@plait/draw';
import { AppSettingPanelComponent } from '../components/setting-panel/setting-panel.component';
import { AppMainToolbarComponent } from '../components/main-toolbar/main-toolbar.component';
import { AppZoomToolbarComponent } from '../components/zoom-toolbar/zoom-toolbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { withCommonPlugin } from '../plugins/with-common';
import { AppMenuComponent } from '../components/menu/menu.component';
import { NgIf } from '@angular/common';
import { withGroup } from '@plait/common';
import { OnChangeData, PlaitBoardComponent } from '@plait/angular-board';

const LOCAL_STORAGE_KEY = 'plait-board-data';

@Component({
    selector: 'app-basic-editor',
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
    plugins: PlaitPlugin[] = [withCommonPlugin, withKnowledgeGraph];

    value: KnowledgeGraphElement[] = [];

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

    CONTROL_KEY = typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform) ? '⌘' : 'Ctrl';

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
                case 'knowledge-graph':
                    this.value = mockKnowledgeGraphData;
                    break;
                default:
                    this.value = [];
                    break;
            }
        });
    }

    change(event: OnChangeData) {
        this.setLocalData(JSON.stringify(event));
        this.selectedElements = getSelectedElements(this.board);
        this.showRemoveGroup = canRemoveGroup(this.board);
        this.showAddGroup = canAddGroup(this.board);
        this.contextMenu.nativeElement.style.display = 'none';
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
        (this.board as any).onAbstractResize = (state: AbstractResizeState) => {};
    }

    themeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        BoardTransforms.updateThemeColor(this.board, value as ThemeColorMode);
    }

    copy(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        setFragment(this.board, WritableClipboardOperationType.copy, null);
    }

    cut(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        setFragment(this.board, WritableClipboardOperationType.cut, null);
        deleteFragment(this.board);
    }

    addGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.addGroup(this.board);
    }

    removeGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.removeGroup(this.board);
    }

    duplicate(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        duplicateElements(this.board);
    }

    async paste(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        const targetPoint = toViewBoxPoint(this.board, toHostPoint(this.board, event.x, event.y));
        const clipboardData = await getClipboardData(null);
        this.board.insertFragment(clipboardData, targetPoint, WritableClipboardOperationType.paste);
    }
}
