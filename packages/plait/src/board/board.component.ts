import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild
} from '@angular/core';
import rough from 'roughjs/bin/rough';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseCursorStatus, CursorStatus } from '../interfaces';
import { DragMove, PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitOperation } from '../interfaces/operation';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistroy } from '../plugins/with-history';
import { withSelection } from '../plugins/with-selection';
import { Transforms } from '../transfroms';
import { getViewBox, transformViewZoom, transformZoom, updateCursorStatus } from '../utils/board';
import { BOARD_TO_ON_CHANGE, HOST_TO_ROUGH_SVG, IS_TEXT_EDITABLE } from '../utils/weak-maps';

@Component({
    selector: 'plait-board',
    template: `
        <svg
            #svg
            width="100%"
            height="100%"
            style="position: relative"
            [style.cursor]="board.cursor === 'drag' ? (dragMove.isDragMoving ? 'grabbing' : 'grab') : 'auto'"
        ></svg>
        <plait-toolbar
            *ngIf="isFocused && !toolbarTemplateRef"
            [cursorStatus]="board.cursor"
            [viewZoom]="viewZoom"
            (dragMoveHandle)="changeDragMode($event)"
            (adaptHandle)="adaptHandle()"
            (zoomInHandle)="zoomInHandle()"
            (zoomOutHandle)="zoomOutHandle()"
            (resetZoomHandel)="resetZoomHandel()"
        ></plait-toolbar>
        <plait-element
            *ngFor="let item of board.children; let index = index; trackBy: trackBy"
            [index]="index"
            [element]="item"
            [board]="board"
            [viewport]="board.viewport"
            [selection]="board.selection"
            [host]="host"
        ></plait-element>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitBoardComponent implements OnInit, AfterViewInit, OnDestroy {
    @HostBinding('class') hostClass = `plait-board-container`;

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$: Subject<any> = new Subject();

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    @ContentChild('plaitToolbar')
    public toolbarTemplateRef!: TemplateRef<any>;

    private _viewZoom: number = 100;

    public get viewZoom(): number {
        const vZoom = transformZoom(this.board.viewport.zoom);
        if (this._viewZoom !== vZoom) {
            this._viewZoom = vZoom;
        }
        return vZoom;
    }

    public dragMove: DragMove = {
        isDragMoving: false,
        x: 0,
        y: 0
    };

    get host(): SVGElement {
        return this.svg.nativeElement;
    }

    get isFocused() {
        return this.board?.selection;
    }

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitReadonly = false;

    @Input() plaitAllowClearBoard = false;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    @HostBinding('class.focused')
    get focused() {
        return this.isFocused;
    }

    constructor(private cdr: ChangeDetectorRef, private renderer2: Renderer2) {}

    ngOnInit(): void {
        const roughSVG = rough.svg(this.host as SVGSVGElement, { options: { roughness: 0, strokeWidth: 1 } });
        HOST_TO_ROUGH_SVG.set(this.host, roughSVG);
        this.initializePlugins();
        this.initializeEvents();
        this.updateViewport();
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.cdr.detectChanges();
            const changeEvent: PlaitBoardChangeEvent = {
                children: this.board.children,
                operations: this.board.operations,
                viewport: this.board.viewport,
                selection: this.board.selection
            };
            // update viewBox
            if (this.board.operations.some(op => PlaitOperation.isSetViewportOperation(op))) {
                this.updateViewport();
            }
            this.plaitChange.emit(changeEvent);
        });
    }

    ngAfterViewInit(): void {
        this.plaitBoardInitialized.emit(this.board);
    }

    initializePlugins() {
        const options: PlaitBoardOptions = { readonly: this.plaitReadonly, allowClearBoard: this.plaitAllowClearBoard };
        let board = withHistroy(withSelection(withBoard(createBoard(this.host, this.plaitValue, options))));
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;
        if (this.plaitViewport) {
            this.board.viewport = this.plaitViewport;
        }
    }

    initializeEvents() {
        fromEvent<MouseEvent>(this.host, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousedown(event);
                this.isFocused && this.board.cursor === BaseCursorStatus.drag && this.initDragMove(event);
            });

        fromEvent<MouseEvent>(this.host, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousemove(event);
                this.isFocused && this.board.cursor === BaseCursorStatus.drag && this.dragMove.isDragMoving && this.dragMoving(event);
            });

        fromEvent<MouseEvent>(document, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.globalMouseup(event);
                this.isFocused && this.dragMoveEnd(event);
            });

        fromEvent<MouseEvent>(this.host, 'dblclick')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.dblclick(event);
            });

        fromEvent<WheelEvent>(this.host, 'wheel')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: WheelEvent) => {
                if (this.isFocused) {
                    event.preventDefault();
                    const viewport = this.board.viewport;
                    Transforms.setViewport(this.board, {
                        ...viewport,
                        offsetX: viewport?.offsetX - event.deltaX,
                        offsetY: viewport?.offsetY - event.deltaY
                    });
                }
            });

        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keydown(event);
                this.isFocused && event.code === 'Space' && this.changeDragMode(BaseCursorStatus.drag);
            });

        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keyup(event);
                this.isFocused && event.code === 'Space' && this.changeDragMode(BaseCursorStatus.select);
            });

        fromEvent<ClipboardEvent>(document, 'copy')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                this.board?.setFragment(event.clipboardData);
            });

        fromEvent<ClipboardEvent>(document, 'paste')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: ClipboardEvent) => {
                this.board?.insertFragment(event.clipboardData);
            });

        fromEvent<ClipboardEvent>(document, 'cut')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                this.board?.setFragment(event.clipboardData);
                this.board?.deleteFragment(event.clipboardData);
            });

        window.onresize = () => {
            this.refreshViewport();
        };
    }

    refreshViewport() {
        const viewBoxModel = getViewBox(this.board);
        const viewBoxValues = this.host.getAttribute('viewBox')?.split(',') as string[];
        this.renderer2.setAttribute(
            this.host,
            'viewBox',
            `${viewBoxValues[0].trim()}, ${viewBoxValues[1].trim()}, ${viewBoxModel.width}, ${viewBoxModel.height}`
        );
    }

    updateViewport() {
        const viewBox = getViewBox(this.board);
        this.renderer2.setAttribute(this.host, 'viewBox', `${viewBox.minX}, ${viewBox.minY}, ${viewBox.width}, ${viewBox.height}`);
    }

    trackBy = (index: number, element: PlaitElement) => {
        return index;
    };

    initDragMove(e: MouseEvent) {
        this.dragMove.isDragMoving = true;
        this.dragMove.x = e.x;
        this.dragMove.y = e.y;
    }

    dragMoving(e: MouseEvent) {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            offsetX: viewport.offsetX + ((e.x - this.dragMove.x) * 100) / this._viewZoom,
            offsetY: viewport.offsetY + ((e.y - this.dragMove.y) * 100) / this._viewZoom
        });
        this.dragMove.x = e.x;
        this.dragMove.y = e.y;
    }

    dragMoveEnd(e: MouseEvent) {
        this.dragMove.isDragMoving = false;
        this.dragMove.x = 0;
        this.dragMove.y = 0;
    }

    // 拖拽模式
    changeDragMode(cursorStatus: BaseCursorStatus) {
        updateCursorStatus(this.board, cursorStatus);
        this.cdr.markForCheck();
    }

    // 适应画布
    adaptHandle() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            offsetX: 0,
            offsetY: 0
        });
        this.resetZoomHandel();
    }

    // 放大
    zoomInHandle() {
        if (this._viewZoom >= 400) {
            return;
        }
        this._viewZoom += 10;
        this.zoomChange();
    }

    // 缩小
    zoomOutHandle() {
        if (this._viewZoom <= 20) {
            return;
        }
        this._viewZoom -= 10;
        this.zoomChange();
    }

    resetZoomHandel() {
        this._viewZoom = 100;
        this.zoomChange();
    }

    zoomChange() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: transformViewZoom(this._viewZoom)
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        HOST_TO_ROUGH_SVG.delete(this.host);
    }
}
