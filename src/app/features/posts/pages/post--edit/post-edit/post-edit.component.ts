import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PostService } from '../../../../../core/services/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../../../../models/interface';
import { switchMap, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { profanityValidator } from '../../../../../shared/validators/profanity-validator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  postForm = this.fb.group({
    id: [0, Validators.required], // start with 0 instead of null
    title: ['', [Validators.required, Validators.minLength(5), profanityValidator]],
    body: ['', [Validators.required, Validators.minLength(20), profanityValidator]],
    userId: [0, Validators.required]
  });

  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.postService.getPostById(+id);
        }
        this.errorMessage.set('Post ID not provided for editing.');
        this.isLoading.set(false);
        return of(null);
      }),
      filter((post): post is Post => !!post)
    ).subscribe({
      next: (post) => {
        this.postForm.patchValue(post);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load post for editing.');
        this.isLoading.set(false);
        console.error(err);
      }
    });

    // Optional: sanitize input values
    this.postForm.get('title')?.valueChanges.subscribe(value => {
      if (value) {
        this.postForm.get('title')?.patchValue(this.sanitizer.sanitize(1, value) || '', { emitEvent: false });
      }
    });

    this.postForm.get('body')?.valueChanges.subscribe(value => {
      if (value) {
        this.postForm.get('body')?.patchValue(this.sanitizer.sanitize(1, value) || '', { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      this.isLoading.set(true);
      this.successMessage.set(null);
      this.errorMessage.set(null);

      const rawForm = this.postForm.value;
      const postId = rawForm.id;

      if (typeof postId === 'number') {
        const updatedPost: Post = {
          id: postId,
          title: rawForm.title || '',
          body: rawForm.body || '',
          tag: '', // default if your model requires it
        };

        this.postService.updatePost(postId, updatedPost).subscribe({
          next: (response) => {
            this.successMessage.set('Post updated successfully!');
            this.isLoading.set(false);
            this.router.navigate(['/posts', response.id]);
          },
          error: (err) => {
            this.errorMessage.set('Failed to update post. Please try again.');
            this.isLoading.set(false);
            console.error(err);
          }
        });
      } else {
        this.errorMessage.set('Post ID is missing for update.');
        this.isLoading.set(false);
      }
    } else {
      this.errorMessage.set('Please correct the errors in the form.');
      this.postForm.markAllAsTouched();
    }
  }

  getSanitizedHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
