import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login/login.component';
import { PostEditComponent } from './features/posts/pages/post--edit/post-edit/post-edit.component';
import { PostCreateComponent } from './features/posts/pages/post-create/post-create/post-create.component';
import { PostDetailsComponent } from './features/posts/pages/post-details/post-details/post-details.component';
import { PostListComponent } from './features/posts/pages/post-list/post-list/post-list.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/create', component: PostCreateComponent, canActivate: [authGuard] },
  { path: 'posts/:id', component: PostDetailsComponent },
  { path: 'posts/:id/edit', component: PostEditComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/posts' } // Wildcard route for 404 or unknown paths
];