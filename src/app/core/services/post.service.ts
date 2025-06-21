import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Post, Comment } from '../../models/interface';
import { HttpParams, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private apiService: ApiService) {}

  getPosts(params: HttpParams): Observable<HttpResponse<Post[]>> {
    return this.apiService.getWithResponse<Post[]>('posts', params);
  }

  getPostById(id: number): Observable<Post> {
    return this.apiService.get<Post>(`posts/${id}`);
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.apiService.get<Comment[]>(`posts/${postId}/comments`);
  }

  createPost(post: Omit<Post, 'id'>): Observable<Post> {
    return this.apiService.post<Post>('posts', post);
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.apiService.put<Post>(`posts/${id}`, post);
  }

  deletePost(id: number): Observable<any> {
    return this.apiService.delete<any>(`posts/${id}`);
  }
}