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
    getRootGroupBBox,
    calculateZoom,
    convertViewport,
    getContentContainerClientBox,
    invert,
    invertViewport,
    transformMat3,
    updateCursorStatus,
    getBoardClientBox
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

    contentContainerWidth = 0;

    contentContainerHeight = 0;

    scrollLeft!: number;

    scrollTop!: number;

    private zoom = 1;

    private canvasWidth!: number;

    private canvasHeight!: number;

    private viewBox!: number[];

    private focusPoint: number[] = [0, 0];

    private matrix!: number[];

    public autoFitPadding = 8;

    public isMoving = false;

    private resizeObserver!: ResizeObserver;

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
        const roughSVG = rough.svg(this.host as SVGSVGElement, {
            options: { roughness: 0, strokeWidth: 1 }
        });
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
            }
            if (options) this.board.options = options.currentValue;
            this.cdr.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        this.plaitBoardInitialized.emit(this.board);
        this.initContainer();
        this.initCanvas();
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
                const { scrollLeft, scrollTop } = event.target as HTMLElement;
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
                this.contentContainerWidth = width + scrollBarWidth;
                this.contentContainerHeight = height + scrollBarWidth;

                const { x, y } = getContentContainerClientBox(this.board);
                this.setViewport(this.board.viewport.zoom, [x, y]);
                this.setViewBox();
            }
        });
        this.resizeObserver.observe(this.elementRef.nativeElement);
    }

    initContainer() {
        const contentContainer = this.contentContainer.nativeElement;
        const containerRect = getBoardClientBox(this.board);
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        this.renderer2.setStyle(contentContainer, 'width', `${containerWidth}px`);
        this.renderer2.setStyle(contentContainer, 'height', `${containerHeight}px`);
        this.renderer2.setStyle(contentContainer, 'maxWidth', `${containerWidth}px`);
        this.renderer2.setStyle(contentContainer, 'maxHeight', `${containerHeight}px`);

        const { width, height } = getContentContainerClientBox(this.board);
        this.contentContainerWidth = width;
        this.contentContainerHeight = height;
    }

    initCanvas() {
        const viewport = this.board.viewport;
        const canvasPoint = viewport?.canvasPoint;
        const zoom = viewport?.zoom ?? this.zoom;
        this.setViewport(zoom);

        if (canvasPoint) {
            const newCanvasPoint = invertViewport([0, 0], this.matrix);
            const scrollLeft = canvasPoint ? this.scrollLeft + (canvasPoint[0] - newCanvasPoint[0]) * zoom : this.scrollLeft;
            const scrollTop = canvasPoint ? this.scrollTop + (canvasPoint[1] - newCanvasPoint[1]) * zoom : this.scrollTop;
            this.setScrollLeft(scrollLeft);
            this.setScrollTop(scrollTop);
        } else {
            const { x, y, width, height } = getRootGroupBBox(this.board, zoom);
            this.focus([x + width / 2, y + height / 2]);
        }
        this.setViewBox();
    }

    focus(point: number[]) {
        const { width, height } = getContentContainerClientBox(this.board);
        const newPoint = [width / 2, height / 2];
        const matrix = transformMat3([], [point[0], point[1], 1], this.matrix);
        const scrollLeft = newPoint[0] - matrix[0];
        const scrollTop = newPoint[1] - matrix[1];
        this.setScrollLeft(this.scrollLeft - scrollLeft);
        this.setScrollTop(this.scrollTop - scrollTop);
    }

    resetFocusPoint() {
        const { x, y, width, height } = getContentContainerClientBox(this.board);
        this.focusPoint = [x + width / 2, y + height / 2];
    }

    setScrollLeft(left: number) {
        const hideScrollbar = this.board.options.hideScrollbar;
        const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const width = this.canvasWidth - this.contentContainerWidth + scrollBarWidth;
        this.scrollLeft = left < 0 ? 0 : left > width ? width : left;
    }

    setScrollTop(top: number) {
        const hideScrollbar = this.board.options.hideScrollbar;
        const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const height = this.canvasHeight - this.contentContainerHeight + scrollBarWidth;
        this.scrollTop = top < 0 ? 0 : top > height ? height : top;
    }

    setScroll(left: number, top: number) {
        this.setScrollLeft(left);
        this.setScrollTop(top);
        this.setViewBox();
    }

    scrollIntoView(node: { x: number; y: number; width: number; height: number }) {
        this.setViewport();
        const canvasRect = this.host.getBoundingClientRect();
        if (!(canvasRect.width <= this.contentContainerWidth && canvasRect.height <= this.contentContainerHeight)) {
            const fullPoint = convertViewport([node.x + node.width, node.y + node.height], this.matrix);
            const width = this.contentContainerWidth;
            const height = this.contentContainerHeight;
            const hideScrollbar = this.board.options.hideScrollbar;
            const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
            let left = this.scrollLeft;
            let top = this.scrollTop;
            if (fullPoint[0] > width - scrollBarWidth) {
                left += fullPoint[0] - width + scrollBarWidth;
            }
            if (fullPoint[1] > height - scrollBarWidth) {
                top += fullPoint[1] - height + scrollBarWidth;
            }
            if (left !== this.scrollLeft || top !== this.scrollTop) {
                this.setScroll(left, top);
            }
        }
    }

    setMatrix() {
        const { viewBox, zoom, scrollLeft, scrollTop } = this;
        this.matrix = [zoom, 0, 0, 0, zoom, 0, -scrollLeft - zoom * viewBox[0], -scrollTop - zoom * viewBox[1], 1];
    }

    setViewport(zoom?: number, focusPoint?: number[]) {
        zoom = calculateZoom(zoom ?? this.zoom);
        focusPoint = focusPoint ?? this.focusPoint;

        const { x, y, width, height } = getContentContainerClientBox(this.board);
        const { left, right, top, bottom } = getRootGroupBBox(this.board, zoom);
        const padding = [height / 2, width / 2];
        const rootGroupWidth = right - left;
        const rootGroupHeight = bottom - top;
        const canvasWidth = rootGroupWidth * zoom + 2 * padding[1];
        const canvasHeight = rootGroupHeight * zoom + 2 * padding[0];
        const viewBox = [left - padding[1] / zoom, top - padding[0] / zoom, canvasWidth / zoom, canvasHeight / zoom];
        let scrollLeft;
        let scrollTop;

        if (this.matrix) {
            const canvasPoint = [focusPoint[0] - x, focusPoint[1] - y, 1];
            const invertMatrix = invert([], this.matrix);
            const matrix1 = transformMat3([], [canvasPoint[0], canvasPoint[1], 1], invertMatrix as []);
            const matrix2 = [zoom, 0, 0, 0, zoom, 0, -zoom * viewBox[0], -zoom * viewBox[1], 1];
            const newMatrix = transformMat3([], matrix1, matrix2);
            scrollLeft = newMatrix[0] - canvasPoint[0];
            scrollTop = newMatrix[1] - canvasPoint[1];
        } else {
            scrollLeft = (canvasWidth - width) / 2;
            scrollTop = padding[0] / 2 - top;
        }
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.zoom = zoom;
        this.viewBox = viewBox;
        this.setScrollLeft(scrollLeft);
        this.setScrollTop(scrollTop);
        this.setMatrix();
    }

    setViewBox() {
        this.renderer2.setStyle(this.host, 'display', 'block');
        this.renderer2.setStyle(this.host, 'width', `${this.canvasWidth}px`);
        this.renderer2.setStyle(this.host, 'height', `${this.canvasHeight}px`);
        if (this.viewBox && this.viewBox[2] > 0 && this.viewBox[3] > 0) {
            this.renderer2.setAttribute(this.host, 'viewBox', this.viewBox.join(','));
        }
        this.contentContainer.nativeElement.scrollLeft = this.scrollLeft;
        this.contentContainer.nativeElement.scrollTop = this.scrollTop;

        this.setMatrix();
        this.setViewportSetting();
    }

    setViewportSetting() {
        const viewport = this.board?.viewport;
        const oldCanvasPoint = viewport?.canvasPoint ?? [];
        const canvasPoint = invertViewport([0, 0], this.matrix);

        if (!canvasPoint.every((item, index) => item === oldCanvasPoint[index])) {
            Transforms.setViewport(this.board, {
                ...viewport,
                zoom: this.zoom,
                canvasPoint
            });
        }
    }

    trackBy = (index: number, element: PlaitElement) => {
        return index;
    };

    // 拖拽模式
    changeMoveMode(cursorStatus: BaseCursorStatus) {
        updateCursorStatus(this.board, cursorStatus);
        this.cdr.markForCheck();
    }

    // 适应画布
    adaptHandle() {
        const { width, height } = getContentContainerClientBox(this.board);
        const rootGroup = this.host.firstChild;
        const rootGroupBox = (rootGroup as SVGGraphicsElement).getBBox();
        const viewportWidth = width - 2 * this.autoFitPadding;
        const viewportHeight = height - 2 * this.autoFitPadding;
        let zoom = this.zoom;
        if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
            zoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
        } else {
            zoom = 1;
        }
        this.focus([rootGroupBox.x + rootGroupBox.width / 2, rootGroupBox.y + rootGroupBox.height / 2]);
        this.resetFocusPoint();
        this.setViewBox();
    }

    // 放大
    zoomInHandle() {
        this.setViewport(this.zoom + 0.1);
        this.setViewBox();
    }

    // 缩小
    zoomOutHandle() {
        this.setViewport(this.zoom - 0.1);
        this.setViewBox();
    }

    resetZoomHandel() {
        this.setViewport(1);
        this.setViewBox();
    }

    movingChange(isMoving: boolean) {
        this.isMoving = isMoving;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        HOST_TO_ROUGH_SVG.delete(this.host);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
