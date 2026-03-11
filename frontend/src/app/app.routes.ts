import { Routes } from '@angular/router';
import { PostsPageComponent } from './pages/posts-page/posts-page.component';
import { PostDetailPageComponent } from './pages/post-detail-page/post-detail-page.component';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { AccountPageComponent } from './pages/account-page/account-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthPageComponent,
  },
  {
    path: 'posts',
    component: PostsPageComponent,
  },
  {
    path: 'posts/:id',
    component: PostDetailPageComponent,
  },
  {
    path: 'account',
    component: AccountPageComponent,
  },
  {
    path: '**',
    redirectTo: 'posts',
  },
];
