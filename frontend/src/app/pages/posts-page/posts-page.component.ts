import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { PostsService, PaginatedResponse, CreatePostDto } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Post, PostStatus, POST_STATUS } from '../../models';
import { environment } from '../../../environments/environment.development';

/** Valor del select: todos los estados o uno concreto */
type FilterStatus = PostStatus | 'TODOS';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: POST_STATUS.CREADO, label: 'Creados' },
  { value: POST_STATUS.PUBLICADO, label: 'Publicados' },
];

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './posts-page.component.html',
  styleUrl: './posts-page.component.scss',
})
export class PostsPageComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  error: string | null = null;
  filter: FilterStatus = 'TODOS';
  view: 'feed' | 'mine' = 'feed';
  showCreateForm = false;
  creating = false;
  selectedImagesFiles: File[] = [];
  selectedImagesNames: string[] = [];
  userMenuOpen = false;

  readonly filterOptions = FILTER_OPTIONS;

  createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
    body: ['', [Validators.required, Validators.minLength(1)]],
  });

  constructor(
    private postsService: PostsService,
    public auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.error = null;

    this.postsService.getPosts().subscribe({
      next: (res: PaginatedResponse<Post>) => {
        this.posts = res.items ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los posts.';
        this.loading = false;
      },
    });
  }

  goToDetail(post: Post) {
    this.router.navigate(['/posts', post._id]);
  }

  goToLogin() {
    this.router.navigateByUrl('/auth');
  }

  logout() {
    this.userMenuOpen = false;
    this.auth.logout();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  filteredPosts(): Post[] {
    const current = this.auth.currentUser;
    let list = this.posts;
    // Timeline pública: solo posts publicados
    list = list.filter(
      (p) => (p.status ?? POST_STATUS.CREADO) === POST_STATUS.PUBLICADO,
    );

    if (this.view === 'mine' && current) {
      list = list.filter((p) => {
        // Si el post tiene información del creador, usamos el id del usuario autenticado
        if (p.createdByUserId) {
          return p.createdByUserId === current.id;
        }
        // Compatibilidad hacia atrás: posts antiguos sin createdBy usan el author
        return p.author === current.name || p.author === current.email;
      });
    }

    if (this.filter === 'TODOS') {
      return list;
    }

    return list.filter((p) => (p.status ?? POST_STATUS.CREADO) === this.filter);
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

  statusClass(status?: PostStatus): string {
    switch (status) {
      case POST_STATUS.PUBLICADO:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case POST_STATUS.CREADO:
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  openCreateForm() {
    this.showCreateForm = true;
    const user = this.auth.currentUser;
    this.createForm.reset();
    this.selectedImagesFiles = [];
    this.selectedImagesNames = [];
    // author se rellena al enviar con el usuario actual
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.createForm.reset();
    this.selectedImagesFiles = [];
    this.selectedImagesNames = [];
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

  submitCreate() {
    if (this.createForm.invalid || !this.auth.currentUser) {
      this.createForm.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser;
    const author = user.name || user.email;

    const dtoBase: Omit<CreatePostDto, 'images'> = {
      title: this.createForm.getRawValue().title,
      body: this.createForm.getRawValue().body,
      author,
      createdByUserId: user.id,
    };

    this.creating = true;

    const createWithImages = (images?: string[]) => {
      const dto: CreatePostDto = {
        ...dtoBase,
        images,
      };
      this.postsService.createPost(dto).subscribe({
        next: () => {
          this.creating = false;
          this.closeCreateForm();
          this.loadPosts();
          this.toast.success('Post creado correctamente.');
        },
        error: (err: unknown) => {
          this.creating = false;
          const msg = (err as { error?: { message?: string } })?.error?.message ?? 'No se pudo crear el post.';
          this.toast.error(msg);
        },
      });
    };

    if (this.selectedImagesFiles.length === 0) {
      createWithImages(undefined);
      return;
    }

    this.postsService.uploadPostImages(this.selectedImagesFiles).subscribe({
      next: (paths: string[]) => {
        createWithImages(paths);
      },
      error: (err: unknown) => {
        this.creating = false;
        const msg =
          (err as { error?: { message?: string } })?.error?.message ??
          'No se pudieron subir las imágenes. Inténtalo de nuevo.';
        this.toast.error(msg);
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

