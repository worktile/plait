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
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions, PlaitBoardViewport } from '../interfaces/board';
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
    toPoint,
    getBoardClientRect,
    transformPoint
} from '../utils';
import {
    BOARD_TO_ON_CHANGE,
    IS_TEXT_EDITABLE,
    BOARD_TO_COMPONENT,
    BOARD_TO_ELEMENT_HOST,
    BOARD_TO_HOST,
    BOARD_TO_ROUGH_SVG
} from '../utils/weak-maps';
import { BoardComponentInterface } from './board.component.interface';
import { RectangleClient } from '../interfaces/rectangle-client';
import { getRectangleByElements } from '../utils/element';

const ElementHostClass = 'element-host';

@Component({
    selector: 'plait-board',
    template: `
        <div class="viewport-container" #viewportContainer>
            <svg #svg width="100%" height="100%" style="position: relative;"><g class="element-host"></g></svg>
            <plait-element
                *ngFor="let item of board.children; let index = index; trackBy: trackBy"
                [index]="index"
                [element]="item"
                [board]="board"
                [selection]="board.selection"
            ></plait-element>
        </div>
        <plait-toolbar
            *ngIf="isFocused && !toolbarTemplateRef"
            [board]="board"
            (adaptHandle)="adaptHandle()"
            (zoomInHandle)="zoomInHandle()"
            (zoomOutHandle)="zoomOutHandle()"
            (resetZoomHandel)="resetZoomHandel()"
        ></plait-toolbar>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitBoardComponent implements BoardComponentInterface, OnInit, OnChanges, AfterViewInit, OnDestroy {
    hasInitialized = false;

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$ = new Subject<void>();

    viewportState: PlaitBoardViewport = {
        zoom: 1,
        autoFitPadding: 8
    };

    private resizeObserver!: ResizeObserver;

    private hostResizeObserver!: ResizeObserver;

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitOptions!: PlaitBoardOptions;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    get isFocused() {
        return this.board?.selection;
    }

    get host(): SVGSVGElement {
        return this.svg.nativeElement;
    }

    @HostBinding('class')
    get hostClass() {
        return `plait-board-container ${this.board.pointer}`;
    }

    @HostBinding('class.readonly')
    get readonly() {
        return this.board.options.readonly;
    }

    @HostBinding('class.focused')
    get focused() {
        return this.isFocused;
    }

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    @ContentChild('plaitToolbar')
    public toolbarTemplateRef!: TemplateRef<any>;

    @ViewChild('viewportContainer', { read: ElementRef, static: true })
    viewportContainer!: ElementRef;

    constructor(public cdr: ChangeDetectorRef, private renderer2: Renderer2, private elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        const elementHost = this.host.querySelector(`.${ElementHostClass}`) as SVGGElement;
        const roughSVG = rough.svg(this.host as SVGSVGElement, {
            options: { roughness: 0, strokeWidth: 1 }
        });
        this.initializePlugins();
        this.initializeEvents();
        this.viewportScrollListener();
        this.elementResizeListener();
        BOARD_TO_COMPONENT.set(this.board, this);
        BOARD_TO_ROUGH_SVG.set(this.board, roughSVG);
        BOARD_TO_HOST.set(this.board, this.host);
        BOARD_TO_ELEMENT_HOST.set(this.board, elementHost);
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

            if (valueChange) this.board.children = valueChange.currentValue;
            if (options) this.board.options = options.currentValue;
            this.cdr.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        this.plaitBoardInitialized.emit(this.board);
        this.initViewportContainer();
    }

    private initializePlugins() {
        let board = withHandPointer(withHistory(withSelection(withBoard(createBoard(this.plaitValue, this.plaitOptions)))));
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;

        if (this.plaitViewport) {
            Transforms.setViewport(this.board, this.plaitViewport);
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
        fromEvent<MouseEvent>(document, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.globalMousemove(event);
            });

        fromEvent<MouseEvent>(this.host, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mouseup(event);
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
                withLatestFrom(fromEvent<MouseEvent>(this.host, 'mousemove')),
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board) && !!this.board.selection;
                })
            )
            .subscribe(([clipboardEvent, mouseEvent]: [ClipboardEvent, MouseEvent]) => {
                const targetPoint = transformPoint(this.board, toPoint(mouseEvent.x, mouseEvent.y, this.host));
                const buffer = 5;
                const clientRect = getBoardClientRect(this.board);

                if (
                    mouseEvent.x < clientRect.x + buffer ||
                    mouseEvent.x > clientRect.right - buffer ||
                    mouseEvent.y < clientRect.y + buffer ||
                    mouseEvent.y > clientRect.bottom - buffer
                ) {
                    return;
                }
                this.board?.insertFragment(clipboardEvent.clipboardData, targetPoint);
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
    }

    private viewportScrollListener() {
        fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'scroll')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !!this.isFocused;
                })
            )
            .subscribe((event: Event) => {
                const { scrollLeft, scrollTop } = event.target as HTMLElement;
                const left = this.viewportState.scrollLeft!;
                const top = this.viewportState.scrollTop!;
                if (Math.abs(left - scrollLeft) >= 1 || Math.abs(top - scrollTop) >= 1) {
                    this.setScroll(scrollLeft, scrollTop);
                }
            });
    }

    private elementResizeListener() {
        // this.resizeObserver = new ResizeObserver(() => {
        //     this.updateViewportS();
        // });
        // this.resizeObserver.observe(this.nativeElement);
    }

    private updateViewportState(state: Partial<PlaitBoardViewport>) {
        this.viewportState = {
            ...this.viewportState,
            ...state
        };
    }

    updateViewport(board: PlaitBoard) {
        this.setViewport();
    }

    applyViewport(board: PlaitBoard) {
        const { viewport } = board;
        const zoom = viewport?.zoom;

        this.calcViewBox(zoom);
        this.adjustViewport();
        this.updateViewBoxStyles();
        this.updateViewportScrolling();
    }

    initViewportContainer() {
        const { width, height } = getBoardClientBox(this.board);
        this.renderer2.setStyle(this.viewportContainer.nativeElement, 'width', `${width}px`);
        this.renderer2.setStyle(this.viewportContainer.nativeElement, 'height', `${height}px`);
    }

    adjustViewport(viewport = this.board.viewport) {
        const originationCoord = viewport?.originationCoord;
        const zoom = viewport?.zoom ?? this.viewportState.zoom;

        if (originationCoord) {
            const matrix = this.getMatrix();
            const [pointX, pointY] = invertViewportCoordinates([0, 0], matrix);
            const scrollLeft = this.viewportState.scrollLeft!;
            const scrollTop = this.viewportState.scrollTop!;
            const left = scrollLeft + (originationCoord[0] - pointX) * zoom;
            const top = scrollTop + (originationCoord[1] - pointY) * zoom;
            this.setScrollLeft(left);
            this.setScrollTop(top);
        } else {
            this.adaptHandle();
        }
    }

    calcViewBox(zoom: number) {
        zoom = clampZoomLevel(zoom);

        const scrollBarWidth = this.plaitOptions?.hideScrollbar ? SCROLL_BAR_WIDTH : 0;
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
            // focusPoint
            const focusX = viewportContainerBox.x + viewportContainerBox.width / 2;
            const focusY = viewportContainerBox.y + viewportContainerBox.height / 2;
            const viewportContainerPoint = [focusX - viewportContainerBox.x, focusY - viewportContainerBox.y, 1];
            const point = invertViewportCoordinates([viewportContainerPoint[0], viewportContainerPoint[1]], matrix);
            const newMatrix = [zoom, 0, 0, 0, zoom, 0, -zoom * viewBox[0], -zoom * viewBox[1], 1];
            const newPoint = transformMat3([], point, newMatrix);

            scrollLeft = newPoint[0] - viewportContainerPoint[0];
            scrollTop = newPoint[1] - viewportContainerPoint[1];
        } else {
            scrollLeft = horizontalPadding;
            scrollTop = verticalPadding;
        }
        this.updateViewportState({
            viewportWidth,
            viewportHeight,
            zoom,
            viewBox
        });
        this.setScrollLeft(scrollLeft);
        this.setScrollTop(scrollTop);
    }

    getMatrix(zoom = this.viewportState.zoom): number[] {
        const { viewBox, scrollLeft, scrollTop } = this.viewportState;
        if (scrollLeft! >= 0 && scrollTop! >= 0) {
            return [zoom, 0, 0, 0, zoom, 0, -scrollLeft! - zoom * viewBox![0], -scrollTop! - zoom * viewBox![1], 1];
        }
        return [];
    }

    setScrollLeft(left: number) {
        const viewportContainerBox = getViewportContainerBox(this.board);
        const scrollBarWidth = this.plaitOptions?.hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const { viewportWidth } = this.viewportState;
        const width = viewportWidth! - viewportContainerBox.width + scrollBarWidth;
        this.viewportState.scrollLeft = left < 0 ? 0 : left > width ? width : left;
    }

    setScrollTop(top: number) {
        const viewportContainerBox = getViewportContainerBox(this.board);
        const scrollBarWidth = this.plaitOptions?.hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const { viewportHeight } = this.viewportState;
        const height = viewportHeight! - viewportContainerBox.height + scrollBarWidth;
        this.viewportState.scrollTop = top < 0 ? 0 : top > height ? height : top;
    }

    setScroll(left: number, top: number) {
        this.setScrollLeft(left);
        this.setScrollTop(top);
        this.setViewport();
    }

    private updateViewBoxStyles() {
        const { host, viewportState } = this;
        const { viewportWidth, viewportHeight, viewBox } = viewportState;

        this.renderer2.setStyle(host, 'display', 'block');
        this.renderer2.setStyle(host, 'width', `${viewportWidth}px`);
        this.renderer2.setStyle(host, 'height', `${viewportHeight}px`);

        if (viewBox && viewBox[2] > 0 && viewBox[3] > 0) {
            this.renderer2.setAttribute(host, 'viewBox', viewBox.join(' '));
        }
    }

    private updateViewportScrolling() {
        const { viewportContainer, viewportState } = this;
        const { scrollLeft, scrollTop } = viewportState;
        viewportContainer.nativeElement.scrollLeft = scrollLeft!;
        viewportContainer.nativeElement.scrollTop = scrollTop!;
    }

    setViewport(zoom = this.viewportState.zoom) {
        this.calcViewBox(zoom);
        const viewport = this.board?.viewport;
        const matrix = this.getMatrix(zoom);
        const originationCoord = invertViewportCoordinates([0, 0], matrix);

        Transforms.setViewport(this.board, {
            ...viewport,
            zoom,
            originationCoord
        });
    }

    trackBy = (index: number, element: PlaitElement) => {
        return index;
    };

    adaptHandle() {
        const containerBox = getViewportContainerBox(this.board);
        const matrix = this.getMatrix();

        const rootGroupBox = getRectangleByElements(this.board, this.board.children, true);
        const centerPoint = [containerBox.width / 2, containerBox.height / 2];
        const rootGroupCenterX = rootGroupBox.x + rootGroupBox.width / 2;
        const rootGroupCenterY = rootGroupBox.y + rootGroupBox.height / 2;
        const transformedPoint = transformMat3([], [rootGroupCenterX, rootGroupCenterY, 1], matrix);

        const offsetLeft = centerPoint[0] - transformedPoint[0];
        const offsetTop = centerPoint[1] - transformedPoint[1];

        const { autoFitPadding, zoom, scrollLeft, scrollTop } = this.viewportState;
        const viewportWidth = containerBox.width - 2 * autoFitPadding;
        const viewportHeight = containerBox.height - 2 * autoFitPadding;
        let newZoom = zoom;
        if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
            newZoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
        } else {
            newZoom = 1;
        }

        this.setScrollLeft(scrollLeft! - offsetLeft);
        this.setScrollTop(scrollTop! - offsetTop);
        this.setViewport(newZoom);
    }

    zoomInHandle() {
        this.setViewport(this.viewportState.zoom + 0.1);
    }

    zoomOutHandle() {
        this.setViewport(this.viewportState.zoom - 0.1);
    }

    resetZoomHandel() {
        this.setViewport(1);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.resizeObserver && this.resizeObserver?.disconnect();
        this.hostResizeObserver && this.hostResizeObserver?.disconnect();
        BOARD_TO_ROUGH_SVG.delete(this.board);
        BOARD_TO_COMPONENT.delete(this.board);
        BOARD_TO_ROUGH_SVG.delete(this.board);
        BOARD_TO_HOST.delete(this.board);
        BOARD_TO_ELEMENT_HOST.delete(this.board);
        BOARD_TO_ON_CHANGE.delete(this.board);
    }

    markForCheck() {
        this.cdr.markForCheck();
    }

    scrollToRectangle(client: RectangleClient) {
        const svgRect = this.host.getBoundingClientRect();
        const viewportContainerBox = getViewportContainerBox(this.board);

        if (svgRect.width > viewportContainerBox.width || svgRect.height > viewportContainerBox.height) {
            const scrollBarWidth = this.plaitOptions?.hideScrollbar ? SCROLL_BAR_WIDTH : 0;
            const matrix = this.getMatrix();
            const [nodePointX, nodePointY] = convertToViewportCoordinates([client.x, client.y], matrix);
            const [fullNodePointX, fullNodePointY] = convertToViewportCoordinates(
                [client.x + client.width, client.y + client.height],
                matrix
            );

            let newLeft = this.viewportState.scrollLeft!;
            let newTop = this.viewportState.scrollTop!;

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

            if (newLeft !== this.viewportState.scrollLeft! || newTop !== this.viewportState.scrollTop!) {
                this.setScroll(newLeft, newTop);
            }
        }
    }
}
