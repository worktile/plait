import { Component, ViewContainerRef, inject } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { PlaitBoard } from '@plait/core';
import { PlaitTextBoard, TextComponentRef } from '@plait/common';
import { Editor, Transforms } from 'slate';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { BoardComponentInterface } from '../board/board.component.interface';
import { withAngular } from './with-angular';

@Component({ template: '' })
class TextHostComponent {
    viewContainerRef = inject(ViewContainerRef);
}

describe('Angular text editing focus', () => {
    it('focuses the editable DOM synchronously on entry and re-entry', fakeAsync(() => {
        const fixture = TestBed.createComponent(TextHostComponent);
        fixture.detectChanges();
        const board = {} as PlaitBoard & PlaitTextBoard;
        BOARD_TO_COMPONENT.set(board, fixture.componentInstance as unknown as BoardComponentInterface);
        const container = document.createElement('div');
        document.body.appendChild(container);
        let editor!: Editor;
        let ref: TextComponentRef | undefined;
        try {
            ref = withAngular(board).renderText(container, {
                board,
                text: { children: [{ text: 'Node' }] },
                afterInit: (value) => (editor = value),
                onChange: () => {}
            });
            flush();
            const editable = container.querySelector('slate-editable') as HTMLElement;
            for (let attempt = 0; attempt < 2; attempt++) {
                ref.update({ readonly: false });
                // Assert before any scheduled Angular render can hide a failed focus call.
                expect(editable.isContentEditable).toBe(true);
                expect(document.activeElement).toBe(editable);
                Transforms.select(editor, [0]);
                flush();
                expect(window.getSelection()?.toString()).toBe('Node');
                Transforms.collapse(editor, { edge: 'end' });
                flush();
                expect(window.getSelection()?.isCollapsed).toBe(true);
                expect(editable.contains(window.getSelection()!.anchorNode)).toBe(true);
                ref.update({ readonly: true });
                flush();
                expect(editable.isContentEditable).toBe(false);
                expect(document.activeElement).not.toBe(editable);
            }
        } finally {
            ref?.destroy();
            container.remove();
            fixture.destroy();
        }
    }));
});
