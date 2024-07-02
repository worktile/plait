import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasicEditorComponent } from './editor/editor.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicFlowComponent } from './flow/flow.component';
import { BasicGraphVizComponent } from './graph-viz/graph-viz.component';

const routes: Routes = [
    {
        path: '',
        component: BasicEditorComponent
    },
    {
        path: 'richtext',
        component: BasicRichtextComponent
    },
    {
        path: 'flow',
        component: BasicFlowComponent
    },
    {
        path: 'graph-viz',
        component: BasicGraphVizComponent
    }
];
@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: false
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
