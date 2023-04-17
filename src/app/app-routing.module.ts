import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasicBoardEditorComponent } from './editor/editor.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
// import { BasicFlowComponent } from './flow/flow.component';

const routes: Routes = [
    {
        path: '',
        component: BasicBoardEditorComponent
    },
    {
        path: 'richtext',
        component: BasicRichtextComponent
    },
    // {
    //     path: 'flow',
    //     component: BasicFlowComponent
    // }
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
