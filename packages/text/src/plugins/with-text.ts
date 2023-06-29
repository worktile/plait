import { Element } from 'slate';
import { AngularEditor, ViewType } from 'slate-angular';
import { CustomElement } from '../custom-types';

export interface PlaitTextEditor extends AngularEditor {
    renderElement: (element: Element) => ViewType;
}

export const withText = <T extends AngularEditor = AngularEditor>(editor: T) => {
    const e = (editor as unknown) as PlaitTextEditor;

    e.renderElement = (element: CustomElement) => {
        return (null as unknown) as ViewType;
    };

    return e;
};
