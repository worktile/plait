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
import { BaseCursorStatus, PlaitOperation } from '../interfaces';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistory } from '../plugins/with-history';
import { withMove } from '../plugins/with-move';
import { withSelection } from '../plugins/with-selection';
import { Transforms } from '../transfroms';
import { calculateZoom, getViewBox, getViewportClientBox, updateCursorStatus } from '../utils/board';
import { BOARD_TO_ON_CHANGE, HOST_TO_ROUGH_SVG, IS_TEXT_EDITABLE, PLAIT_BOARD_TO_COMPONENT } from '../utils/weak-maps';

@Component({
    selector: 'plait-board',
    template: `
        <div class="container" #container>
            <svg #svg width="100%" height="100%" style="position: relative"></svg>
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

    private autoFitPadding = 8;

    public isMoving: boolean = false;

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
            if (this.board.operations.some(op => PlaitOperation.isSetViewportOperation(op))) {
                this.updateViewport();
            }
            this.plaitChange.emit(changeEvent);
        });
        this.hasInitialized = true;
    }

    ngOnChanges(changes: SimpleChanges): void {
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
        this.initContainerSize();
        this.updateViewport();
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

        fromEvent<WheelEvent>(this.contentContainer.nativeElement, 'wheel')
            .pipe(
                takeUntil(this.destroy$),
                filter((e: WheelEvent) => {
                    if (!this.isFocused) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return !!this.isFocused;
                })
            )
            .subscribe();

        fromEvent<MouseEvent>(this.contentContainer.nativeElement, 'scroll')
            .pipe(
                takeUntil(this.destroy$),
                filter((e: MouseEvent) => {
                    if (!this.isFocused) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return !!this.isFocused;
                })
            )
            .subscribe((event: Event) => {
                const scrollLeft = (event.target as HTMLElement).scrollLeft;
                const scrollTop = (event.target as HTMLElement).scrollTop;
                this.getScrollOffset(scrollLeft, scrollTop);
            });

        window.onresize = () => {
            this.updateViewport();
        };
    }

    initContainerSize() {
        this.renderer2.setStyle(this.contentContainer.nativeElement, 'overflow', 'auto');
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

    setScroll(left: number, top: number) {
        const container = this.contentContainer.nativeElement as HTMLElement;
        container.scrollTo({
            top,
            left
        });
    }

    getScrollOffset(left: number, top: number) {
        const viewportBox = getViewportClientBox(this.board);
        const viewBox = getViewBox(this.board);
        const scrollLeftRatio = left / (viewBox.viewportWidth - viewportBox.width);
        const scrollTopRatio = top / (viewBox.viewportHeight - viewportBox.height);

        this.setViewport({
            offsetXRatio: scrollLeftRatio,
            offsetYRatio: scrollTopRatio
        });
    }

    viewportChange() {
        const viewBox = getViewBox(this.board);
        const offsetXRatio = this.board.viewport.offsetXRatio;
        const offsetYRatio = this.board.viewport.offsetYRatio;
        const viewportBox = getViewportClientBox(this.board);
        const { minX, minY, width, height, viewportWidth, viewportHeight } = viewBox;
        const box = [minX, minY, width, height];
        const scrollLeft = (viewportWidth - viewportBox.width) * offsetXRatio;
        const scrollTop = (viewportHeight - viewportBox.height) * offsetYRatio;

        this.renderer2.setStyle(this.host, 'display', 'block');
        this.renderer2.setStyle(this.host, 'width', `${viewportWidth}px`);
        this.renderer2.setStyle(this.host, 'height', `${viewportHeight}px`);
        this.renderer2.setStyle(this.host, 'cursor', this.isMoveMode ? 'grab' : 'default');

        if (width > 0 && height > 0) {
            this.renderer2.setAttribute(this.host, 'viewBox', box.join());
        }
        this.setScroll(scrollLeft, scrollTop);
    }

    updateViewport() {
        this.resizeViewport();
        this.viewportChange();
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
        const viewportBox = getViewportClientBox(this.board);
        const rootGroup = this.host.firstChild;
        const rootGroupBox = (rootGroup as SVGGraphicsElement).getBBox();
        const viewportWidth = viewportBox.width - 2 * this.autoFitPadding;
        const viewportHeight = viewportBox.height - 2 * this.autoFitPadding;

        let zoom = this.board.viewport.zoom;
        if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
            zoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
        }

        this.setViewport({
            zoom: calculateZoom(zoom),
            offsetXRatio: 0.5,
            offsetYRatio: 0.5
        });
    }

    // 放大
    zoomInHandle() {
        const zoom = this.board.viewport.zoom;
        this.setViewport({
            zoom: calculateZoom(zoom + 0.1)
        });
    }

    // 缩小
    zoomOutHandle() {
        const zoom = this.board.viewport.zoom;
        this.setViewport({
            zoom: calculateZoom(zoom - 0.1)
        });
    }

    resetZoomHandel() {
        this.setViewport({
            zoom: 1
        });
    }

    setViewport(options: Partial<Viewport>) {
        const viewport = this.board?.viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            ...options
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        HOST_TO_ROUGH_SVG.delete(this.host);
    }

    movingChange(isMoving: boolean) {
        this.isMoving = isMoving;
    }
}
