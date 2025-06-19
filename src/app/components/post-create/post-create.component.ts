import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-post-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.scss'
})
export class PostCreateComponent {
  postForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      body: ['', [Validators.required, Validators.minLength(10)]],
      tag: ['', Validators.required]
    });
  }

  submitPost() {
    if (this.postForm.invalid) return;

    const sanitizedData = {
      ...this.postForm.value,
      body: this.sanitizer.sanitize(1, this.postForm.value.body || '') || ''
    };

    this.isSubmitting = true;
    this.apiService.createPost(sanitizedData as any).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => (this.isSubmitting = false)
    });
  }
}


