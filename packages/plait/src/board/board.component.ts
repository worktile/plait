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
import { PlaitPointerType } from '../interfaces';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistory } from '../plugins/with-history';
import { withHandPointer } from '../plugins/with-hand';
import { withSelection } from '../plugins/with-selection';
import { Transforms } from '../transforms';
import {
    getRootGroupBBox,
    clampZoomLevel,
    convertToViewportCoordinates,
    getViewportContainerBox,
    invertViewportCoordinates,
    transformMat3,
    getBoardClientBox,
    updatePointerType
} from '../utils';
import { BOARD_TO_ON_CHANGE, HOST_TO_ROUGH_SVG, IS_TEXT_EDITABLE, PLAIT_BOARD_TO_COMPONENT } from '../utils/weak-maps';

@Component({
    selector: 'plait-board',
    template: `
        <div class="viewport-container" #viewportContainer>
            <svg #svg width="100%" height="100%" style="position: relative;"></svg>
            <plait-element
                *ngFor="let item of board.children; let index = index; trackBy: trackBy"
                [index]="index"
                [element]="item"
                [board]="board"
                [selection]="board.selection"
                [host]="host"
            ></plait-element>
        </div>
        <plait-toolbar
            *ngIf="isFocused && !toolbarTemplateRef"
            [pointerType]="board.pointer"
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

    private zoom = 1;

    private viewportWidth!: number;

    private viewportHeight!: number;

    private viewBox!: number[];

    private focusPoint!: number[];

    private autoFitPadding = 8;

    private scrollBarWidth = SCROLL_BAR_WIDTH;

    public scrollLeft!: number;

    public scrollTop!: number;

    public isMoving = false;

    private resizeObserver!: ResizeObserver;

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitOptions!: PlaitBoardOptions;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    get host(): SVGElement {
        return this.svg.nativeElement;
    }

    get isFocused() {
        return this.board?.selection;
    }

    @HostBinding('class')
    get hostClass() {
        return `plait-board-container ${this.board.pointer}`;
    }

    @HostBinding('class.readonly')
    get readonly() {
        return this.board.options.readonly;
    }

    @HostBinding('class.moving')
    get moving() {
        return this.board.pointer === PlaitPointerType.hand && this.isMoving;
    }

    @HostBinding('class.focused')
    get focused() {
        return this.isFocused;
    }

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    @ContentChild('plaitToolbar')
    public toolbarTemplateRef!: TemplateRef<any>;

    @ViewChild('viewportContainer', { read: ElementRef, static: true })
    viewportContainer!: ElementRef;

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
        this.initViewportContainer();
        this.setViewport(this.board.viewport?.zoom ?? this.zoom);
        this.initViewport();
    }

    private initializePlugins() {
        let board = withHandPointer(withHistory(withSelection(withBoard(createBoard(this.host, this.plaitValue, this.plaitOptions)))));
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;
        this.scrollBarWidth = this.plaitOptions?.hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        if (this.plaitViewport) {
            this.board.viewport = this.plaitViewport;
        }
    }

    private initializeEvents() {
        fromEvent<MouseEvent>(this.host, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                if (!this.focusPoint) {
                    this.focusPoint = [event.clientX, event.clientY];
                }
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

        fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'mousemove')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((e: MouseEvent) => {
                this.focusPoint = [e.clientX, e.clientY];
            });

        fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'mouseleave')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((e: MouseEvent) => {
                this.resetCenterFocusPoint();
            });

        fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'scroll')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((event: Event) => {
                const { scrollLeft, scrollTop } = event.target as HTMLElement;
                if (Math.abs(this.scrollLeft - scrollLeft) >= 1 || Math.abs(this.scrollTop - scrollTop) >= 1) {
                    this.setScrollLeft(scrollLeft);
                    this.setScrollTop(scrollTop);
                    this.setViewportSetting();
                }
            });
        this.resizeElement();
    }

    resizeElement() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { x, y } = getViewportContainerBox(this.board);
                this.initViewportContainer();
                this.setViewport(this.board.viewport.zoom, [x, y]);
                this.setViewBox();
            }
        });
        this.resizeObserver.observe(this.elementRef.nativeElement);
    }

    initViewportContainer() {
        const { width, height } = getBoardClientBox(this.board);
        this.renderer2.setStyle(this.viewportContainer.nativeElement, 'width', `${width}px`);
        this.renderer2.setStyle(this.viewportContainer.nativeElement, 'height', `${height}px`);
    }

    initViewport() {
        const viewport = this.board.viewport;
        const canvasPoint = viewport?.canvasPoint;
        const zoom = viewport?.zoom ?? this.zoom;

        if (canvasPoint) {
            const matrix = this.getMatrix();
            const [pointX, pointY] = invertViewportCoordinates([0, 0], matrix);
            const left = this.scrollLeft + (canvasPoint[0] - pointX) * zoom;
            const top = this.scrollTop + (canvasPoint[1] - pointY) * zoom;
            this.setScroll(left, top);
        } else {
            this.resetCenterFocusPoint();
            this.adaptHandle();
        }
    }

    setViewport(zoom = this.zoom, focusPoint = this.focusPoint) {
        zoom = clampZoomLevel(zoom);

        const scrollBarWidth = this.scrollBarWidth;
        const viewportContainerBox = getViewportContainerBox(this.board);
        const groupBBox = getRootGroupBBox(this.board, zoom);
        const horizontalPadding = viewportContainerBox.width / 2;
        const verticalPadding = viewportContainerBox.height / 2;
        const viewportWidth = (groupBBox.right - groupBBox.left) * zoom + 2 * horizontalPadding + scrollBarWidth;
        const viewportHeight = (groupBBox.bottom - groupBBox.top) * zoom + 2 * verticalPadding + scrollBarWidth;

        const viewBox = [
            groupBBox.left - horizontalPadding / zoom,
            groupBBox.top - verticalPadding / zoom,
            viewportWidth / zoom,
            viewportHeight / zoom
        ];
        const matrix = this.getMatrix();
        let scrollLeft;
        let scrollTop;

        if (matrix.length > 0) {
            const viewportContainerPoint = [focusPoint[0] - viewportContainerBox.x, focusPoint[1] - viewportContainerBox.y, 1];
            const point = invertViewportCoordinates([viewportContainerPoint[0], viewportContainerPoint[1]], matrix);
            const newMatrix = [zoom, 0, 0, 0, zoom, 0, -zoom * viewBox[0], -zoom * viewBox[1], 1];
            const newPoint = transformMat3([], point, newMatrix);

            scrollLeft = newPoint[0] - viewportContainerPoint[0];
            scrollTop = newPoint[1] - viewportContainerPoint[1];
        } else {
            scrollLeft = horizontalPadding;
            scrollTop = verticalPadding;
        }
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.zoom = zoom;
        this.viewBox = viewBox;
        this.setScrollLeft(scrollLeft);
        this.setScrollTop(scrollTop);
    }

    getMatrix() {
        const { viewBox, zoom, scrollLeft, scrollTop } = this;
        if (scrollLeft >= 0 && scrollTop >= 0) {
            return [zoom, 0, 0, 0, zoom, 0, -scrollLeft - zoom * viewBox[0], -scrollTop - zoom * viewBox[1], 1];
        }
        return [];
    }

    resetCenterFocusPoint() {
        const { x, y, width, height } = getViewportContainerBox(this.board);
        this.focusPoint = [x + width / 2, y + height / 2];
    }

    setScrollLeft(left: number) {
        const viewportContainerBox = getViewportContainerBox(this.board);
        const width = this.viewportWidth - viewportContainerBox.width + this.scrollBarWidth;
        this.scrollLeft = left < 0 ? 0 : left > width ? width : left;
    }

    setScrollTop(top: number) {
        const viewportContainerBox = getViewportContainerBox(this.board);
        const height = this.viewportHeight - viewportContainerBox.height + this.scrollBarWidth;
        this.scrollTop = top < 0 ? 0 : top > height ? height : top;
    }

    setScroll(left: number, top: number) {
        this.setScrollLeft(left);
        this.setScrollTop(top);
        this.setViewBox();
    }

    scrollNodeIntoView(node: { x: number; y: number; width: number; height: number }) {
        this.setViewport();
        this.setViewBox();

        const canvasRect = this.host.getBoundingClientRect();
        const viewportContainerBox = getViewportContainerBox(this.board);

        if (canvasRect.width > viewportContainerBox.width || canvasRect.height > viewportContainerBox.height) {
            const matrix = this.getMatrix();
            const scrollBarWidth = this.scrollBarWidth;
            const [nodePointX, nodePointY] = convertToViewportCoordinates([node.x, node.y], matrix);
            const [fullNodePointX, fullNodePointY] = convertToViewportCoordinates([node.x + node.width, node.y + node.height], matrix);

            let newLeft = this.scrollLeft;
            let newTop = this.scrollTop;

            if (nodePointX < 0) {
                newLeft -= Math.abs(nodePointX);
            }
            if (nodePointX > 0 && fullNodePointX > viewportContainerBox.width) {
                newLeft += fullNodePointX - viewportContainerBox.width + scrollBarWidth;
            }

            if (nodePointY < 0) {
                newTop -= Math.abs(nodePointY);
            }
            if (nodePointY > 0 && fullNodePointY > viewportContainerBox.height) {
                newTop += fullNodePointY - viewportContainerBox.height + scrollBarWidth;
            }

            if (newLeft !== this.scrollLeft || newTop !== this.scrollTop) {
                this.setScroll(newLeft, newTop);
            }
        }
    }

    setViewBox() {
        this.updateViewBoxStyles();
        this.updateViewportScrolling();
        this.setViewportSetting();
    }

    private updateViewBoxStyles() {
        const { host, viewportWidth, viewportHeight, viewBox } = this;

        this.renderer2.setStyle(host, 'display', 'block');
        this.renderer2.setStyle(host, 'width', `${viewportWidth}px`);
        this.renderer2.setStyle(host, 'height', `${viewportHeight}px`);

        if (viewBox && viewBox[2] > 0 && viewBox[3] > 0) {
            this.renderer2.setAttribute(host, 'viewBox', viewBox.join(' '));
        }
    }

    private updateViewportScrolling() {
        const { viewportContainer, scrollLeft, scrollTop } = this;
        viewportContainer.nativeElement.scrollLeft = scrollLeft;
        viewportContainer.nativeElement.scrollTop = scrollTop;
    }

    setViewportSetting() {
        const viewport = this.board?.viewport;
        const oldCanvasPoint = viewport?.canvasPoint ?? [];
        const matrix = this.getMatrix();
        const canvasPoint = invertViewportCoordinates([0, 0], matrix);

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

    changeMoveMode(cursorStatus: PlaitPointerType) {
        updatePointerType(this.board, cursorStatus);
        this.cdr.markForCheck();
    }

    adaptHandle() {
        const containerBox = getViewportContainerBox(this.board);
        const rootGroup = this.host.firstChild as SVGGraphicsElement;
        const matrix = this.getMatrix();

        const rootGroupBox = rootGroup.getBBox();
        const centerPoint = [containerBox.width / 2, containerBox.height / 2];
        const rootGroupCenterX = rootGroupBox.x + rootGroupBox.width / 2;
        const rootGroupCenterY = rootGroupBox.y + rootGroupBox.height / 2;
        const transformedPoint = transformMat3([], [rootGroupCenterX, rootGroupCenterY, 1], matrix);

        const offsetLeft = centerPoint[0] - transformedPoint[0];
        const offsetTop = centerPoint[1] - transformedPoint[1];

        const viewportWidth = containerBox.width - 2 * this.autoFitPadding;
        const viewportHeight = containerBox.height - 2 * this.autoFitPadding;
        let newZoom = this.zoom;
        if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
            newZoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
        } else {
            newZoom = 1;
        }

        this.setScrollLeft(this.scrollLeft - offsetLeft);
        this.setScrollTop(this.scrollTop - offsetTop);
        this.setViewport(newZoom);
        this.setViewBox();
    }

    zoomInHandle() {
        this.setViewport(this.zoom + 0.1);
        this.setViewBox();
    }

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
