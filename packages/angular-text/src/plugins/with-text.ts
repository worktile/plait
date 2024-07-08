import { PlaitBoard } from '@plait/core';
import { CLIPBOARD_FORMAT_KEY } from '@plait/text-plugins';
import { AngularEditor } from 'slate-angular';
import { PlaitTextEditor } from './text.editor';

export const withText = <T extends AngularEditor>(editor: T, board: PlaitBoard) => {
    const e = editor as T & PlaitTextEditor;
    const { insertData } = e;

    e.insertBreak = () => {
        editor.insertText('\n');
    };

    e.insertData = (data: DataTransfer) => {
        let text = data.getData('text/plain');
        let plaitData = data.getData(`application/${CLIPBOARD_FORMAT_KEY}`);
        if (!plaitData && text) {
            if (text.endsWith('\n')) {
                text = text.substring(0, text.length - 1);
            }
            text = text.trim().replace(/\t+/g, ' ');
            e.insertText(text);
            return;
        }
        insertData(data);
    };

    e.board = board;

    return e;
};
