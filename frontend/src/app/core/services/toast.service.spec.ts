import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should add a toast to the list', (done) => {
      service.toasts$.subscribe((toasts) => {
        if (toasts.length > 0) {
          expect(toasts[0].message).toBe('Test message');
          expect(toasts[0].type).toBe('info');
          done();
        }
      });

      service.show('Test message', 'info', 0);
    });

    it('should auto-dismiss toast after duration', fakeAsync(() => {
      let currentToasts: Toast[] = [];

      service.toasts$.subscribe((toasts) => {
        currentToasts = toasts;
      });

      service.show('Auto dismiss', 'info', 1000);

      expect(currentToasts.length).toBe(1);

      tick(1000);

      expect(currentToasts.length).toBe(0);
    }));

    it('should not auto-dismiss when duration is 0', fakeAsync(() => {
      let currentToasts: Toast[] = [];

      service.toasts$.subscribe((toasts) => {
        currentToasts = toasts;
      });

      service.show('No auto dismiss', 'info', 0);

      tick(5000);

      expect(currentToasts.length).toBe(1);
    }));

    it('should assign unique ids to toasts', () => {
      let toasts: Toast[] = [];

      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('Toast 1', 'info', 0);
      service.show('Toast 2', 'info', 0);
      service.show('Toast 3', 'info', 0);

      expect(toasts.length).toBe(3);
      const ids = toasts.map((t) => t.id);
      expect(new Set(ids).size).toBe(3);
    });
  });

  describe('success', () => {
    it('should create a success toast', (done) => {
      service.toasts$.subscribe((toasts) => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('success');
          expect(toasts[0].message).toBe('Success!');
          done();
        }
      });

      service.success('Success!', 0);
    });
  });

  describe('error', () => {
    it('should create an error toast', (done) => {
      service.toasts$.subscribe((toasts) => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('error');
          expect(toasts[0].message).toBe('Error occurred');
          done();
        }
      });

      service.error('Error occurred', 0);
    });
  });

  describe('info', () => {
    it('should create an info toast', (done) => {
      service.toasts$.subscribe((toasts) => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('info');
          expect(toasts[0].message).toBe('Info message');
          done();
        }
      });

      service.info('Info message', 0);
    });
  });

  describe('dismiss', () => {
    it('should remove a specific toast by id', () => {
      let toasts: Toast[] = [];

      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('Toast 1', 'info', 0);
      service.show('Toast 2', 'error', 0);
      service.show('Toast 3', 'success', 0);

      expect(toasts.length).toBe(3);

      const toastToRemove = toasts[1];
      service.dismiss(toastToRemove.id);

      expect(toasts.length).toBe(2);
      expect(toasts.find((t) => t.id === toastToRemove.id)).toBeUndefined();
    });

    it('should do nothing if toast id not found', () => {
      let toasts: Toast[] = [];

      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('Toast 1', 'info', 0);

      expect(toasts.length).toBe(1);

      service.dismiss(99999);

      expect(toasts.length).toBe(1);
    });
  });

  describe('multiple toasts', () => {
    it('should handle multiple toasts with different durations', fakeAsync(() => {
      let toasts: Toast[] = [];

      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('Quick toast', 'info', 500);
      service.show('Slow toast', 'error', 2000);
      service.show('No dismiss', 'success', 0);

      expect(toasts.length).toBe(3);

      tick(500);
      expect(toasts.length).toBe(2);

      tick(1500);
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe('No dismiss');
    }));
  });
});
