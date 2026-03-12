import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { Comment, Post, PostStatus, POST_STATUS } from '../../models';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './post-detail-page.component.html',
  styleUrl: './post-detail-page.component.scss',
})
export class PostDetailPageComponent implements OnInit {
  readonly POST_STATUS = POST_STATUS;
  post: Post | null = null;
  comments: Comment[] = [];
  loadingPost = false;
  loadingComments = false;
  savingComment = false;
  error: string | null = null;

  commentForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    body: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    public auth: AuthService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No se encontró el post.';
      return;
    }
    this.loadPost(id);
    this.loadComments(id);
  }

  private loadPost(id: string) {
    this.loadingPost = true;
    this.postsService.getPost(id).subscribe({
      next: (post) => {
        this.post = post;
        this.loadingPost = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el post.';
        this.loadingPost = false;
      },
    });
  }

  private loadComments(id: string) {
    this.loadingComments = true;
    this.postsService.getComments(id).subscribe({
      next: (res) => {
        this.comments = res.items ?? [];
        this.loadingComments = false;
      },
      error: () => {
        this.loadingComments = false;
      },
    });
  }

  canVerify(): boolean {
    return false;
  }

  canPublish(): boolean {
    return (
      !!this.post &&
      this.post.status === POST_STATUS.CREADO &&
      this.auth.isLoggedIn
    );
  }

  canComment(): boolean {
    return !!(
      this.post &&
      (this.post.status ?? POST_STATUS.CREADO) === POST_STATUS.PUBLICADO &&
      this.auth.isLoggedIn
    );
  }

  statusLabel(status?: PostStatus): string {
    switch (status) {
      case POST_STATUS.PUBLICADO:
        return 'Publicado';
      case POST_STATUS.CREADO:
      default:
        return 'Creado';
    }
  }

  statusBadgeClass(status?: PostStatus): string {
    switch (status) {
      case POST_STATUS.PUBLICADO:
        return 'badge-published';
      case POST_STATUS.CREADO:
      default:
        return 'badge-created';
    }
  }

  statusDescription(status?: PostStatus): string {
    switch (status) {
      case POST_STATUS.CREADO:
        return 'Borrador creado, pendiente de publicar.';
      case POST_STATUS.PUBLICADO:
        return 'Visible para todos y abierto a comentarios.';
      default:
        return '';
    }
  }

  updateStatus(nextStatus: PostStatus): void {
    if (!this.post) return;
    this.postsService
      .updatePost(this.post._id, { status: nextStatus })
      .subscribe({
        next: (post) => {
          this.post = post;
        },
      });
  }

  submitComment() {
    if (!this.post || !this.canComment() || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.savingComment = true;

    this.postsService
      .createComment({
        ...this.commentForm.getRawValue(),
        postId: this.post._id,
      })
      .subscribe({
        next: (comment) => {
          this.comments = [comment, ...this.comments];
          this.commentForm.reset();
          this.savingComment = false;
        },
        error: () => {
          this.savingComment = false;
        },
      });
  }

  imageUrl(image: string | undefined): string | null {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `${environment.apiUrl}${image}`;
  }
}

