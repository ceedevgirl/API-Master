import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Post } from '../../models/interface';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailsComponent implements OnInit {
  post: Post | null = null;
  postId!: number;

  readonly tags = ['health', 'technology', 'photography', 'travel', 'design', 'education', 'lifestyle', 'food', 'development', 'ai'];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));

    this.apiService.getPostWithComments(this.postId).subscribe((post) => {
      const tag = this.getRandomTag();
      const imageUrl = `https://picsum.photos/seed/post-${post.id}/600/400`;
      this.post = { ...post, imageUrl, tag };
    });
  }

  getRandomTag(): string {
    return this.tags[Math.floor(Math.random() * this.tags.length)];
  }
}
