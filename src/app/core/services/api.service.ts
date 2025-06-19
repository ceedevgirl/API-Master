import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, retry, throwError, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post, PostImage } from '../../models/interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/posts`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getImageWithPosts(): Observable<PostImage[]> {
    const tags = ['health', 'technology', 'photography', 'nature', 'design', 'culture'];

    return this.http.get<Post[]>(`${this.baseUrl}/posts`).pipe(
      retry(2),
      map((posts: Post[]): PostImage[] => {
        return posts.map((post: Post): PostImage => {
          const tag = tags[Math.floor(Math.random() * tags.length)];
          const imageUrl = `https://picsum.photos/seed/${post.id}/800/600`;
          return { ...post, tag, imageUrl };
        });
      }),
      catchError(this.handleError)
    );
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/posts/${id}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${this.baseUrl}/posts`, post).pipe(
      catchError(this.handleError)
    );
  }

  updatePost(id: number, post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/posts/${id}`, post).pipe(
      catchError(this.handleError)
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/posts/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: unknown): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error('Something went wrong!'));
  }

  getPostWithComments(postId: number): Observable<Post> {
  return this.http.get<Post>(`${this.baseUrl}/posts/${postId}?_embed=comments`);
}

}
