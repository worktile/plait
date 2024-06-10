import { Transforms } from 'slate';
import { AngularEditor } from 'slate-angular';
import { LinkEditor, getTextFromClipboard, isUrl, withLink } from '@plait/text-plugins';

export const withPasteLink = <T extends AngularEditor>(editor: T): T => {
    const { insertData } = editor;
    editor.insertData = data => {
        const text = getTextFromClipboard(data);
        if (typeof text === 'string' && text && isUrl(text)) {
            LinkEditor.wrapLink(editor, text, text);
            Transforms.move(editor, { distance: 1, unit: 'offset' });
        } else {
            insertData(data);
        }
    };

    return withLink(editor);
};
