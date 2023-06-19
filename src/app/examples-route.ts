import { ɵEmptyOutletComponent as EmptyOutletComponent, Route } from '@angular/router';
import { BasicBoardEditorComponent } from './editor/editor.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicFlowComponent } from './flow/flow.component';

export const examplesRoute: Route = {
    path: 'examples',
    component: EmptyOutletComponent,
    children: [
        {
            path: 'mind',
            component: BasicBoardEditorComponent
        },
        {
            path: 'richtext',
            component: BasicRichtextComponent
        },
        {
            path: 'flow',
            component: BasicFlowComponent
        }
    ]
};
