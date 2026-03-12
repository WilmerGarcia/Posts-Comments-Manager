import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { PostsService, PaginatedResponse, CreatePostDto } from '../../services/posts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { formatDate } from '../../../../core/utils';
import { Post, PostStatus, POST_STATUS } from '../../../../models';
import { environment } from '../../../../../environments/environment.development';
import { IconEyeComponent } from '../../../../shared/icons/icon-eye.component';
import { IconEditComponent } from '../../../../shared/icons/icon-edit.component';
import { IconTrashComponent } from '../../../../shared/icons/icon-trash.component';
import { IconCloseComponent } from '../../../../shared/icons/icon-close.component';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    IconEyeComponent,
    IconEditComponent,
    IconTrashComponent,
    IconCloseComponent,
  ],
  templateUrl: './posts-page.component.html',
  styleUrl: './posts-page.component.scss',
})
export class PostsPageComponent implements OnInit {
  /** Signals obligatorios (requisito 2.3) */
  posts = signal<Post[]>([]);
  search = signal<string>('');
  filteredPosts = computed(() =>
    this.posts().filter((p) => {
      const term = this.search().trim().toLowerCase();
      if (!term) return true;
      return p.title.toLowerCase().includes(term);
    }),
  );
  displayedPosts = computed(() => {
    const user = this.auth.currentUser;
    let result = this.posts();

    // Vista \"Mis posts\": solo posts del usuario (en cualquier estado)
    if (user && this.view === 'mine') {
      result = result.filter((p) => {
        // Si el post tiene información del creador, usamos el id del usuario autenticado
        if (p.createdByUserId) {
          return p.createdByUserId === user.id;
        }
        // Compatibilidad hacia atrás: posts antiguos sin createdBy usan el author
        return p.author === user.name || p.author === user.email;
      });
    } else {
      // Vista \"Lista de posts\" o usuario sin login: solo publicados
      result = result.filter(
        (p) => (p.status ?? POST_STATUS.CREADO) === POST_STATUS.PUBLICADO,
      );
    }

    // Filtro por búsqueda (título)
    const term = this.search().trim().toLowerCase();
    if (term) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(term),
      );
    }

    return result;
  });

  loading = false;
  error: string | null = null;
  view: 'feed' | 'mine' = 'feed';
  showCreateForm = false;
  creating = false;
  selectedImagesFiles: File[] = [];
  selectedImagesNames: string[] = [];
  deletingId: string | null = null;
  showDeleteModal = false;
  postToDelete: Post | null = null;
  userMenuOpen = false;

  /** Formulario reactivo: title min 3, body min 10, author requerido (requisito 2.2) */
  createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    body: ['', [Validators.required, Validators.minLength(10)]],
    author: ['', [Validators.required]],
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
        this.posts.set(res.items ?? []);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los posts.';
        this.loading = false;
      },
    });
  }

  onSearchChange(value: string) {
    this.search.set(value);
    // Siempre recargamos desde el backend para tener datos frescos
    this.loadPosts();
  }

  setView(view: 'feed' | 'mine') {
    this.view = view;
    this.loadPosts();
  }

  goToDetail(post: Post) {
    this.router.navigate(['/posts', post._id]);
  }

  goToEdit(post: Post, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/posts', post._id, 'edit']);
  }

  deletePost(post: Post, event: Event) {
    const user = this.auth.currentUser;
    const isOwner =
      !!user &&
      (
        (post.createdByUserId && post.createdByUserId === user.id) ||
        (!post.createdByUserId && (post.author === user.name || post.author === user.email))
      );
    if (!isOwner) {
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    this.postToDelete = post;
    this.showDeleteModal = true;
  }

  cancelDeletePost() {
    this.showDeleteModal = false;
    this.postToDelete = null;
  }

  confirmDeletePost() {
    if (!this.postToDelete) return;
    const post = this.postToDelete;
    this.showDeleteModal = false;
    this.postToDelete = null;

    this.deletingId = post._id;
    this.postsService.deletePost(post._id).subscribe({
      next: () => {
        this.deletingId = null;
        this.toast.success('Post eliminado.');
        this.loadPosts();
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('No se pudo eliminar el post.');
      },
    });
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

  isOwner(post: Post): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    if (post.createdByUserId) {
      return post.createdByUserId === user.id;
    }
    return post.author === user.name || post.author === user.email;
  }

  formatDate(value: string | undefined): string {
    return formatDate(value);
  }

  openCreateForm() {
    this.showCreateForm = true;
    const user = this.auth.currentUser;
    this.createForm.reset({
      title: '',
      body: '',
      author: user ? user.name || user.email || '' : '',
    });
    this.selectedImagesFiles = [];
    this.selectedImagesNames = [];
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
    const user = this.auth.currentUser;
    if (this.createForm.invalid || !user) {
      this.createForm.markAllAsTouched();
      return;
    }

    const dtoBase: Omit<CreatePostDto, 'images'> = {
      title: this.createForm.getRawValue().title,
      body: this.createForm.getRawValue().body,
      author: this.createForm.getRawValue().author,
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
