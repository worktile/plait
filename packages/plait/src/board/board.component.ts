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
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import rough from 'roughjs/bin/rough';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { SCROLL_BAR_WIDTH } from '../constants';
import { BaseCursorStatus } from '../interfaces';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistory } from '../plugins/with-history';
import { withMove } from '../plugins/with-move';
import { withSelection } from '../plugins/with-selection';
import { Transforms } from '../transforms';
import {
    calculateBBox,
    calculateZoom,
    convertViewport,
    getViewportCanvasBox,
    getViewportClientBox,
    invert,
    invertViewport,
    transformMat3,
    updateCursorStatus
} from '../utils';
import { BOARD_TO_ON_CHANGE, HOST_TO_ROUGH_SVG, IS_TEXT_EDITABLE, PLAIT_BOARD_TO_COMPONENT } from '../utils/weak-maps';

@Component({
    selector: 'plait-board',
    template: `
        <div class="viewport-container" #container>
            <svg #svg width="100%" height="100%" style="position: relative;"></svg>
            <plait-element
                *ngFor="let item of board.children; let index = index; trackBy: trackBy"
                [index]="index"
                [element]="item"
                [board]="board"
                [viewport]="board.viewport"
                [selection]="board.selection"
                [host]="host"
            ></plait-element>
        </div>
        <plait-toolbar
            *ngIf="isFocused && !toolbarTemplateRef"
            [cursorStatus]="board.cursor"
            [viewZoom]="board.viewport!.zoom"
            (moveHandle)="changeMoveMode($event)"
            (adaptHandle)="adaptHandle()"
            (zoomInHandle)="zoomInHandle()"
            (zoomOutHandle)="zoomOutHandle()"
            (resetZoomHandel)="resetZoomHandel()"
        ></plait-toolbar>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitBoardComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    hasInitialized = false;

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$: Subject<any> = new Subject();

    public autoFitPadding = 8;

    public isMoving: boolean = false;

    private zoom = 1;

    private width = 0;

    private height = 0;

    private viewportCanvasBox = {};

    private canvasWidth!: number;

    private canvasHeight!: number;

    private viewBox!: number[];

    private focusPoint: number[] = [0, 0];

    private matrix!: number[];

    private resizeObserver!: ResizeObserver;

    scrollLeft!: number;

    scrollTop!: number;

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitOptions!: PlaitBoardOptions;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    public get isMoveMode(): boolean {
        return this.board.cursor === BaseCursorStatus.move;
    }

    get host(): SVGElement {
        return this.svg.nativeElement;
    }

    get isFocused() {
        return this.board?.selection;
    }

    @HostBinding('class')
    get hostClass() {
        return `plait-board-container ${this.board.cursor}`;
    }

    @HostBinding('class.readonly')
    get readonly() {
        return this.board.options.readonly;
    }

    @HostBinding('class.moving')
    get moving() {
        return this.board.cursor === BaseCursorStatus.move && this.isMoving;
    }

    @HostBinding('class.focused')
    get focused() {
        return this.isFocused;
    }

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    @ContentChild('plaitToolbar')
    public toolbarTemplateRef!: TemplateRef<any>;

    @ViewChild('container', { read: ElementRef, static: true })
    contentContainer!: ElementRef;

    constructor(public cdr: ChangeDetectorRef, private renderer2: Renderer2, private elementRef: ElementRef) {}

    ngOnInit(): void {
        const roughSVG = rough.svg(this.host as SVGSVGElement, { options: { roughness: 0, strokeWidth: 1 } });
        HOST_TO_ROUGH_SVG.set(this.host, roughSVG);
        this.initializePlugins();
        this.initializeEvents();
        PLAIT_BOARD_TO_COMPONENT.set(this.board, this);
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.cdr.detectChanges();
            const changeEvent: PlaitBoardChangeEvent = {
                children: this.board.children,
                operations: this.board.operations,
                viewport: this.board.viewport,
                selection: this.board.selection
            };
            if (this.board.operations.some(op => ['insert_node', 'remove_node'].includes(op.type))) {
                this.updateViewport();
            }
            this.plaitChange.emit(changeEvent);
        });
        this.hasInitialized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.hasInitialized) {
            const valueChange = changes['plaitValue'];
            const options = changes['plaitOptions'];

            if (valueChange) {
                this.board.children = valueChange.currentValue;
                this.set(this.board.viewport);
            }
            if (options) this.board.options = options.currentValue;
            this.cdr.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        this.plaitBoardInitialized.emit(this.board);
        this.initContainerSize();
        this.setViewport(1);
        this.set(this.plaitViewport);
    }

    private initializePlugins() {
        let board = withMove(withHistory(withSelection(withBoard(createBoard(this.host, this.plaitValue, this.plaitOptions)))));
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;
        if (this.plaitViewport) {
            this.board.viewport = this.plaitViewport;
        }
    }

    private initializeEvents() {
        fromEvent<MouseEvent>(this.host, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousedown(event);
            });

        fromEvent<MouseEvent>(this.host, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousemove(event);
            });

        fromEvent<MouseEvent>(document, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.globalMouseup(event);
            });

        fromEvent<MouseEvent>(this.host, 'dblclick')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.dblclick(event);
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

        fromEvent<MouseEvent>(this.contentContainer.nativeElement, 'mousemove')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((e: MouseEvent) => {
                this.focusPoint = [e.clientX, e.clientY];
            });

        fromEvent<MouseEvent>(this.contentContainer.nativeElement, 'mouseleave')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((e: MouseEvent) => {
                this.resetFocusPoint();
            });

        fromEvent<MouseEvent>(this.contentContainer.nativeElement, 'scroll')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((event: Event) => {
                const scrollLeft = (event.target as HTMLElement).scrollLeft;
                const scrollTop = (event.target as HTMLElement).scrollTop;

                (Math.abs(this.scrollLeft - scrollLeft) <= 1 && Math.abs(this.scrollTop - scrollTop) <= 1) ||
                    this.setScroll(scrollLeft, scrollTop);
            });
        this.resizeElement();
    }

    resizeElement() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                const hideScrollbar = this.board.options.hideScrollbar;
                const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
                this.width = width + scrollBarWidth;
                this.height = height + scrollBarWidth;
                this.changeSize();
            }
        });
        this.resizeObserver.observe(this.elementRef.nativeElement);
    }

    initContainerSize() {
        const clientBox = getViewportClientBox(this.board);
        this.width = clientBox.width;
        this.height = clientBox.height;
        this.resizeViewport();
    }

    resizeViewport() {
        const container = this.elementRef.nativeElement?.parentElement;
        const containerRect = container?.getBoundingClientRect();
        const hideScrollbar = this.board.options.hideScrollbar;
        const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const width = `${containerRect.width + scrollBarWidth}px`;
        const height = `${containerRect.height + scrollBarWidth}px`;

        this.renderer2.setStyle(this.contentContainer.nativeElement, 'width', width);
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'height', height);
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'maxWidth', width);
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'maxHeight', height);
    }

    setMatrix() {
        const viewBox = this.viewBox;
        const zoom = this.zoom;
        this.matrix = [zoom, 0, 0, 0, zoom, 0, -this.scrollLeft - zoom * viewBox[0], -this.scrollTop - zoom * viewBox[1], 1];
    }

    updateViewport() {
        const clientBox = getViewportClientBox(this.board);
        this.setViewport(this.board.viewport.zoom, [clientBox.x, clientBox.y]);
    }

    setViewport(zoom?: number, focusPoint?: number[]) {
        zoom = zoom ?? this.zoom;
        zoom = calculateZoom(zoom);
        if (zoom !== this.zoom) {
            this.zoom = zoom;
        }

        focusPoint = focusPoint ?? this.focusPoint;

        let scrollLeft;
        let scrollTop;
        const clientBox = getViewportClientBox(this.board);
        const matrix = this.matrix;
        const box = calculateBBox(this.board, zoom);
        const padding = [clientBox.height / 2, clientBox.width / 2];
        const rootGroupWidth = box.right - box.left;
        const rootGroupHeight = box.bottom - box.top;
        const canvasWidth = rootGroupWidth * zoom + 2 * padding[1];
        const canvasHeight = rootGroupHeight * zoom + 2 * padding[0];
        const viewBox = [box.left - padding[1] / zoom, box.top - padding[0] / zoom, canvasWidth / zoom, canvasHeight / zoom];

        if (matrix) {
            const canvasPoint = [focusPoint[0] - clientBox.x, focusPoint[1] - clientBox.y, 1];
            const invertMatrix = invert([], matrix);
            const matrix1 = transformMat3([], [canvasPoint[0], canvasPoint[1], 1], invertMatrix as []);
            const matrix2 = [zoom, 0, 0, 0, zoom, 0, -zoom * viewBox[0], -zoom * viewBox[1], 1];
            const newMatrix = transformMat3([], matrix1, matrix2);

            scrollLeft = newMatrix[0] - canvasPoint[0];
            scrollTop = newMatrix[1] - canvasPoint[1];
        } else {
            scrollLeft = (canvasWidth - clientBox.width) / 2;
            scrollTop = padding[0] / 2 - box.top;
        }

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.zoom = zoom;
        this.viewBox = viewBox;
        this.setScrollLeft(scrollLeft);
        this.setScrollTop(scrollTop);
        this.change();
    }

    setScrollLeft(left: number) {
        const hideScrollbar = this.board.options.hideScrollbar;
        const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const width = this.canvasWidth - this.width + scrollBarWidth;
        this.scrollLeft = left < 0 ? 0 : left > width ? width : left;
    }

    setScrollTop(top: number) {
        const hideScrollbar = this.board.options.hideScrollbar;
        const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const height = this.canvasHeight - this.height + scrollBarWidth;
        this.scrollTop = top < 0 ? 0 : top > height ? height : top;
    }

    setScroll(left: number, top: number) {
        this.setScrollLeft(left);
        this.setScrollTop(top);
        this.change();
    }

    moveTo(point: number[], zoom: number) {
        zoom = zoom ?? this.zoom;
        const r = invertViewport([0, 0], this.matrix);
        this.setScroll(this.scrollLeft + (point[0] - r[0]) * zoom, this.scrollTop + (point[1] - r[1]) * zoom);
    }

    scrollIntoView(node: { x: number; y: number; width: number; height: number }) {
        const canvasRect = this.host.getBoundingClientRect();

        if (!(canvasRect.width <= this.width && canvasRect.height <= this.height)) {
            const point = convertViewport([node.x, node.y], this.matrix);
            const fullPoint = convertViewport([node.x + node.width, node.y + node.height], this.matrix);
            const width = this.width;
            const height = this.height;
            let left = this.scrollLeft;
            let top = this.scrollTop;

            if (point[0] < 0) {
                left -= Math.abs(point[0]);
            } else if (fullPoint[0] > width - SCROLL_BAR_WIDTH) {
                left += fullPoint[0] - width + SCROLL_BAR_WIDTH;
            }
            if (point[1] < 0) {
                top -= Math.abs(point[1]) + SCROLL_BAR_WIDTH;
            } else if (fullPoint[1] > height - SCROLL_BAR_WIDTH) {
                top += fullPoint[1] - height + SCROLL_BAR_WIDTH;
            }
            (left === this.scrollLeft && top === this.scrollTop) || this.setScroll(left, top);
        }
    }

    change() {
        this.resizeViewport();
        this.renderer2.setStyle(this.host, 'display', 'block');
        this.renderer2.setStyle(this.host, 'width', `${this.canvasWidth}px`);
        this.renderer2.setStyle(this.host, 'height', `${this.canvasHeight}px`);

        this.renderer2.setAttribute(this.host, 'viewBox', this.viewBox.join(','));

        this.contentContainer.nativeElement.scrollLeft = this.scrollLeft;
        this.contentContainer.nativeElement.scrollTop = this.scrollTop;

        this.setMatrix();
        this.setViewportSetting();
        this.viewportCanvasBox = getViewportCanvasBox(this.board, this.matrix);
    }

    restoreCanvasPoint(point: number[], zoom?: number) {
        zoom = zoom ?? this.zoom;
        this.setViewport(zoom);
        this.moveTo(point, zoom);
    }

    set(viewport: Viewport) {
        const canvasPoint = viewport.canvasPoint;

        if (canvasPoint) {
            this.restoreCanvasPoint(canvasPoint, viewport.zoom);
        } else {
            this.setViewport(viewport.zoom);
            this.setScroll(this.scrollLeft, this.scrollTop);
        }
    }

    setViewportSetting() {
        const viewport = this.board?.viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: this.zoom,
            canvasPoint: invertViewport([0, 0], this.matrix)
        });
    }

    changeSize() {
        this.updateViewport();
    }

    trackBy = (index: number, element: PlaitElement) => {
        return index;
    };

    // 拖拽模式
    changeMoveMode(cursorStatus: BaseCursorStatus) {
        updateCursorStatus(this.board, cursorStatus);
        this.cdr.markForCheck();
    }

    focus(point: number[]) {
        const clientBox = getViewportClientBox(this.board);
        const matrix = transformMat3([], [point[0], point[1], 1], this.matrix);
        const newPoint = [clientBox.width / 2, clientBox.height / 2];
        const scrollLeft = newPoint[0] - matrix[0];
        const scrollTop = newPoint[1] - matrix[1];

        this.setScrollLeft(this.scrollLeft - scrollLeft);
        this.setScrollTop(this.scrollTop - scrollTop);
        this.setMatrix();
    }

    resetFocusPoint() {
        const clientBox = getViewportClientBox(this.board);
        this.focusPoint = [clientBox.x + clientBox.width / 2, clientBox.y + clientBox.height / 2];
    }

    // 适应画布
    adaptHandle() {
        const clientBox = getViewportClientBox(this.board);
        const rootGroup = this.host.firstChild;
        const rootGroupBox = (rootGroup as SVGGraphicsElement).getBBox();
        const viewportWidth = clientBox.width - 2 * this.autoFitPadding;
        const viewportHeight = clientBox.height - 2 * this.autoFitPadding;

        let zoom = this.zoom;
        if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
            zoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
        } else {
            zoom = 1;
        }
        this.focus([rootGroupBox.x + rootGroupBox.width / 2, rootGroupBox.y + rootGroupBox.height / 2]);
        this.resetFocusPoint();
        this.setViewport(zoom);
    }

    // 放大
    zoomInHandle() {
        this.setViewport(this.zoom + 0.1);
    }

    // 缩小
    zoomOutHandle() {
        this.setViewport(this.zoom - 0.1);
    }

    resetZoomHandel() {
        this.setViewport(1);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        HOST_TO_ROUGH_SVG.delete(this.host);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    movingChange(isMoving: boolean) {
        this.isMoving = isMoving;
    }
}
