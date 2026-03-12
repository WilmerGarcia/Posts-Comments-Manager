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
import { IconLogoComponent } from '../../../../shared/icons/icon-logo.component';

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
    IconLogoComponent,
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

  /** Total de publicaciones cargadas */
  totalPostsCount = computed(() => this.posts().length);

  /** Cuántas publicaciones son del usuario actual */
  myPostsCount = computed(() => {
    const user = this.auth.currentUser;
    if (!user) return 0;
    return this.posts().filter((p) => {
      if (p.createdByUserId) return p.createdByUserId === user.id;
      return p.author === user.name || p.author === user.email;
    }).length;
  });

  loading = false;
  error: string | null = null;
  view: 'feed' | 'mine' = 'feed';

  /** Paginación */
  currentPage = 1;
  totalPages = 1;
  totalFromApi = 0;
  readonly pageSize = 10;
  showCreateForm = false;
  showBulkForm = false;
  creating = false;
  bulkCreating = false;
  selectedImagesFiles: File[] = [];
  selectedImagesNames: string[] = [];
  deletingId: string | null = null;
  showDeleteModal = false;
  postToDelete: Post | null = null;
  userMenuOpen = false;
  bulkJson = '';

  /** Example JSON for bulk create (avoids literal braces in template) */
  bulkExampleJson =
    '[{ "title": "Post 1", "body": "Contenido...", "author": "User 1", "status": "PUBLICADO" },\n { "title": "Post 2", "body": "Contenido...", "author": "User 2", "status": "CREADO" }]';

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

  loadPosts(page = 1) {
    this.loading = true;
    this.error = null;
    this.postsService.getPosts(page, this.pageSize).subscribe({
      next: (res: PaginatedResponse<Post>) => {
        this.posts.set(res.items ?? []);
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.totalFromApi = res.total;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los posts.';
        this.loading = false;
      },
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadPosts(page);
  }

  onSearchChange(value: string) {
    this.search.set(value);
    this.loadPosts(1);
  }

  setView(view: 'feed' | 'mine') {
    this.view = view;
    this.loadPosts(1);
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
        this.loadPosts(this.currentPage);
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

  openBulkForm() {
    this.showBulkForm = true;
    this.bulkJson = '';
  }

  closeBulkForm() {
    this.showBulkForm = false;
    this.bulkJson = '';
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

  submitBulkCreate() {
    const user = this.auth.currentUser;
    if (!user) {
      this.toast.error('Debes iniciar sesión para crear posts.');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(this.bulkJson);
    } catch {
      this.toast.error('El contenido no es un JSON válido.');
      return;
    }

    let postsInput: unknown;
    if (Array.isArray(parsed)) {
      postsInput = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { posts?: unknown }).posts)) {
      postsInput = (parsed as { posts: unknown }).posts;
    } else {
      this.toast.error('Debe ser un array de posts o un objeto con la propiedad "posts".');
      return;
    }

    const postsArray = (postsInput as unknown[]).map((item) => {
      const obj = item as Partial<CreatePostDto>;
      return {
        title: obj.title ?? '',
        body: obj.body ?? '',
        author: obj.author ?? (this.auth.currentUser?.name || this.auth.currentUser?.email || ''),
        createdByUserId: user.id,
        images: obj.images ?? [],
        status: obj.status,
      } satisfies CreatePostDto;
    });

    if (postsArray.length === 0) {
      this.toast.error('El array de posts está vacío.');
      return;
    }

    this.bulkCreating = true;
    this.postsService.createPostBulk(postsArray).subscribe({
      next: () => {
        this.bulkCreating = false;
        this.closeBulkForm();
        this.loadPosts();
        this.toast.success('Posts creados correctamente.');
      },
      error: (err: unknown) => {
        this.bulkCreating = false;
        const msg =
          (err as { error?: { message?: string } })?.error?.message ??
          'No se pudieron crear los posts.';
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
