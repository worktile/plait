import { Transforms } from 'slate';
import { AngularEditor } from 'slate-angular';
import { CLIPBOARD_FORMAT_KEY } from '../constant';

export const withSingleLine = <T extends AngularEditor>(editor: T) => {
    const e = editor as T;
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

    return e;
};
