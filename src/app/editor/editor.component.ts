import { Component, OnInit } from '@angular/core';
import { getSelectedElements, PlaitBoard, PlaitBoardChangeEvent, PlaitElement, Transforms, Viewport } from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { mockData } from './mock-data';
import { MindNodeShape, MindTransforms, withMind, setAbstract, canSetAbstract } from '@plait/mind';
import { withEmojiExtend } from './emoji/with-emoji-extend';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board-editor',
    templateUrl: './editor.component.html'
})
export class BasicBoardEditorComponent implements OnInit {
    plugins = [withMind, withEmojiExtend];

    value: PlaitElement[] = [...mockData];

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

    layoutChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindLayoutType;
        const selectedElement = getSelectedElements(this.board)?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            MindTransforms.setLayout(this.board, value, path);
        }
    }

    shapeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindNodeShape;
        const selectedElement = getSelectedElements(this.board)?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            Transforms.setNode(this.board, { shape: value }, path);
        }
    }

    setAbstract(event: Event) {
        const selectedElements = getSelectedElements(this.board);
        const ableSetAbstract = selectedElements.every(element => {
            return canSetAbstract(element);
        });

        if (ableSetAbstract) {
            setAbstract(this.board, selectedElements);
        }
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
