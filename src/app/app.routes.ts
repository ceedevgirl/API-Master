import { Routes } from '@angular/router';
import { PostDetailsComponent } from './components/post-detail/post-detail.component';
import { PostEditComponent } from './components/post-edit/post-edit.component';
import { PostListComponent } from './components/posts-list/posts-list.component';
import { authGuard } from './core/guards/auth.guard';
import { PostCreateComponent } from './components/post-create/post-create.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Move login to /login route
  { path: '', component: PostListComponent }, // Default page (Post list)
  { path: 'post/:id', component: PostDetailsComponent },
  { path: 'create', component: PostCreateComponent, canActivate: [authGuard] },
  { path: 'edit/:id', component: PostEditComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' } // Wildcard to handle unknown routes
];
