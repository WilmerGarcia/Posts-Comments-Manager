import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Comment, Post, PostStatus, POST_STATUS } from '../../../../models';
import { environment } from '../../../../../environments/environment.development';
import { IconEditComponent } from '../../../../shared/icons/icon-edit.component';
import { IconTrashComponent } from '../../../../shared/icons/icon-trash.component';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, IconEditComponent, IconTrashComponent],
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
  editingCommentId: string | null = null;
  editingBody = '';
  error: string | null = null;
  showDeleteCommentModal = false;
  commentToDelete: Comment | null = null;

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
    // Uso obligatorio de switchMap (requisito 2.4 RxJS): cargar post al cambiar el id en la ruta
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loadingPost = true;
          this.error = null;
        }),
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.error = 'No se encontró el post.';
            this.loadingPost = false;
            return of(null);
          }
          return this.postsService.getPost(id);
        }),
        tap(() => {
          this.loadingPost = false;
        }),
      )
      .subscribe({
        next: (post) => {
          if (post) {
            this.post = post;
            const user = this.auth.currentUser;
            if (user) {
              this.commentForm.patchValue({
                name: user.name || user.email || '',
                email: user.email,
              });
            }
            this.loadComments(post._id);
          }
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

  isCommentOwner(comment: Comment): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    return comment.email === user.email;
  }

  private isOwner(): boolean {
    if (!this.post || !this.auth.currentUser) return false;
    const user = this.auth.currentUser;
    return this.post.author === (user.name || user.email);
  }

  canVerify(): boolean {
    return false;
  }

  canPublish(): boolean {
    return (
      !!this.post &&
      this.post.status === POST_STATUS.CREADO &&
      this.auth.isLoggedIn &&
      this.isOwner()
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

  publishPost() {
    if (!this.post || !this.isOwner()) return;
    this.postsService
      .updatePost(this.post._id, { status: POST_STATUS.PUBLICADO })
      .subscribe({
        next: (updated) => {
          this.post = updated;
          this.loadComments(updated._id);
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

  startEditComment(comment: Comment) {
    if (!this.isCommentOwner(comment)) return;
    this.editingCommentId = comment._id;
    this.editingBody = comment.body;
  }

  cancelEditComment() {
    this.editingCommentId = null;
    this.editingBody = '';
  }

  saveEditComment(comment: Comment) {
    if (!this.post || !this.isCommentOwner(comment)) return;
    const body = this.editingBody.trim();
    if (!body) {
      return;
    }
    this.savingComment = true;
    this.postsService.updateComment(comment._id, { body }).subscribe({
      next: (updated) => {
        this.comments = this.comments.map((c) => (c._id === updated._id ? updated : c));
        this.savingComment = false;
        this.editingCommentId = null;
        this.commentForm.reset();
        const user = this.auth.currentUser;
        if (user) {
          this.commentForm.patchValue({
            name: user.name || user.email || '',
            email: user.email,
          });
        }
      },
      error: () => {
        this.savingComment = false;
      },
    });
  }

  deleteComment(comment: Comment) {
    if (!this.isCommentOwner(comment)) return;
    this.commentToDelete = comment;
    this.showDeleteCommentModal = true;
  }

  cancelDeleteCommentConfirm() {
    this.showDeleteCommentModal = false;
    this.commentToDelete = null;
  }

  confirmDeleteComment() {
    if (!this.commentToDelete || !this.isCommentOwner(this.commentToDelete)) return;
    const comment = this.commentToDelete;
    this.showDeleteCommentModal = false;
    this.commentToDelete = null;

    this.postsService.deleteComment(comment._id).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c._id !== comment._id);
      },
    });
  }

  imageUrl(image: string | undefined): string | null {
    if (!image) return null;
    let value = image.replace(/\\/g, '/');
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    if (value.startsWith(environment.apiUrl)) {
      return value;
    }
    if (!value.startsWith('/')) {
      value = '/' + value;
    }
    return `${environment.apiUrl}${value}`;
  }
}
