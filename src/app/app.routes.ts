import { Routes } from '@angular/router';
import { PostDetailsComponent } from './components/post-detail/post-detail.component';
import { PostEditComponent } from './components/post-edit/post-edit.component';
import { PostListComponent } from './components/posts-list/posts-list.component';
import { authGuard } from './core/guards/auth.guard';
import { PostCreateComponent } from './components/post-create/post-create.component';

export const routes: Routes = [
    { path: '', component: PostListComponent },
  { path: 'post/:id', component: PostDetailsComponent },
  { path: 'create', component: PostEditComponent, canActivate: [authGuard] },
  { path: 'edit/:id', component: PostCreateComponent, canActivate: [authGuard] } 
];
