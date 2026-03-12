import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { PostsService, UpdatePostDto } from '../../services/posts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Post, POST_STATUS, PostStatus } from '../../../../models';
import { environment } from '../../../../../environments/environment.development';
import { IconTrashComponent } from '../../../../shared/icons/icon-trash.component';

@Component({
  selector: 'app-post-edit-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconTrashComponent],
  templateUrl: './post-edit-page.component.html',
  styleUrl: './post-edit-page.component.scss',
})
export class PostEditPageComponent implements OnInit {
  readonly POST_STATUS = POST_STATUS;
  post: Post | null = null;
  loading = true;
  saving = false;
  error: string | null = null;

   // Gestión de imágenes
  existingImages: string[] = [];
  selectedImagesFiles: File[] = [];
  selectedImagesNames: string[] = [];

  /** Formulario reactivo con validaciones: title min 3, body min 10, author requerido */
  editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    body: ['', [Validators.required, Validators.minLength(10)]],
    author: ['', [Validators.required]],
    status: [POST_STATUS.CREADO as PostStatus, [Validators.required]],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    public auth: AuthService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) throw new Error('No id');
          return this.postsService.getPost(id);
        }),
      )
      .subscribe({
        next: (post) => {
          this.post = post;
          this.loading = false;
          this.existingImages = [...(post.images ?? [])];
          this.editForm.patchValue({
            title: post.title,
            body: post.body,
            author: post.author,
            status: post.status ?? POST_STATUS.CREADO,
          });
        },
        error: () => {
          this.error = 'No se pudo cargar el post.';
          this.loading = false;
        },
      });
  }

  submitEdit() {
    if (!this.post || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const baseDto: Omit<UpdatePostDto, 'images'> = this.editForm.getRawValue();

    const doUpdate = (images?: string[]) => {
      const dto: UpdatePostDto = {
        ...baseDto,
        images,
      };
      this.saving = true;
      this.postsService.updatePost(this.post!._id, dto).subscribe({
        next: (updated) => {
          this.post = updated;
          this.saving = false;
          this.toast.success('Post actualizado.');
          this.router.navigate(['/posts', this.post!._id]);
        },
        error: (err: unknown) => {
          this.saving = false;
          const msg =
            (err as { error?: { message?: string } })?.error?.message ?? 'No se pudo actualizar el post.';
          this.toast.error(msg);
        },
      });
    };

    // Si no hay nuevas imágenes seleccionadas, solo mandamos las existentes (posiblemente recortadas)
    if (this.selectedImagesFiles.length === 0) {
      doUpdate(this.existingImages.length ? [...this.existingImages] : undefined);
      return;
    }

    // Primero subimos las nuevas imágenes y luego actualizamos el post
    this.saving = true;
    this.postsService.uploadPostImages(this.selectedImagesFiles).subscribe({
      next: (paths: string[]) => {
        const allImages = [...this.existingImages, ...paths];
        doUpdate(allImages);
      },
      error: (err: unknown) => {
        this.saving = false;
        const msg =
          (err as { error?: { message?: string } })?.error?.message ??
          'No se pudieron subir las nuevas imágenes. Inténtalo de nuevo.';
        this.toast.error(msg);
      },
    });
  }

  cancel() {
    this.router.navigate(this.post ? ['/posts', this.post._id] : ['/posts']);
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) {
      this.selectedImagesFiles = [];
      this.selectedImagesNames = [];
      return;
    }
    this.selectedImagesFiles = Array.from(files);
    this.selectedImagesNames = this.selectedImagesFiles.map((f) => f.name);
  }

  removeExistingImage(image: string) {
    this.existingImages = this.existingImages.filter((img) => img !== image);
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
