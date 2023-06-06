import { Component, OnInit } from '@angular/core';
import {
    BoardTransforms,
    getSelectedElements,
    PlaitBoard,
    PlaitBoardChangeEvent,
    PlaitBoardOptions,
    PlaitElement,
    Transforms,
    Viewport
} from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { mockData } from './mock-data';
import { MindTransforms, withMind, canSetAbstract, MindElementShape, PlaitMindBoard, MindPointerType } from '@plait/mind';
import { withEmojiExtend } from './emoji/with-emoji-extend';
import { AbstractResizeState } from '@plait/mind';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board-editor',
    templateUrl: './editor.component.html'
})
export class BasicBoardEditorComponent implements OnInit {
    plugins = [withMind, withEmojiExtend];

    value: PlaitElement[] = [...mockData];

    options: PlaitBoardOptions = {
        readonly: false,
        hideScrollbar: false,
        disabledScrollOnNonFocus: false
    }

    viewport!: Viewport;

    board!: PlaitBoard;

    ngOnInit(): void {
        const data = this.getLocalData() as PlaitBoardChangeEvent;
        if (data) {
            this.value = data.children;
            this.viewport = data.viewport;
        }
    }

    change(event: PlaitBoardChangeEvent) {
        this.setLocalData(JSON.stringify(event));
    }

    setLocalData(data: string) {
        localStorage.setItem(`${LOCAL_DATA_KEY}`, data);
    }

    getLocalData() {
        const data = localStorage.getItem(`${LOCAL_DATA_KEY}`);
        return data ? JSON.parse(data) : null;
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
        (this.board as PlaitMindBoard).onAbstractResize = (state: AbstractResizeState) => {};
    }
}
