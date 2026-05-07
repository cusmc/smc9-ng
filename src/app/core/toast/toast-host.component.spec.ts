import { BehaviorSubject } from 'rxjs';
import { ToastHostComponent } from './toast-host.component';
import { ToastItem } from './toast.models';

describe('ToastHostComponent', () => {
  let component: ToastHostComponent;
  let mockToast: { items: BehaviorSubject<ToastItem[]>; dismiss: jasmine.Spy };

  beforeEach(() => {
    mockToast = {
      items: new BehaviorSubject<ToastItem[]>([]),
      dismiss: jasmine.createSpy('dismiss')
    };
    component = new ToastHostComponent(mockToast as any);
  });

  describe('constructor', () => {
    it('initializes toasts from service items', () => {
      const items: ToastItem[] = [{ id: '1', message: 'Hello', variant: 'info' }];
      mockToast.items.next(items);
      expect(component.toasts).toEqual(items);
    });
  });

  describe('dismiss()', () => {
    it('delegates to toast.dismiss with the given id', () => {
      component.dismiss('abc');
      expect(mockToast.dismiss).toHaveBeenCalledOnceWith('abc');
    });
  });

  describe('panelClass()', () => {
    it('returns info class for info variant', () => {
      const result = component.panelClass({ id: '1', message: 'Hi', variant: 'info' });
      expect(result['border-border bg-surface text-ink']).toBeTrue();
      expect(result['border-border bg-success-bg text-success']).toBeFalse();
    });

    it('returns success class for success variant', () => {
      const result = component.panelClass({ id: '2', message: 'Done', variant: 'success' });
      expect(result['border-border bg-success-bg text-success']).toBeTrue();
      expect(result['border-border bg-surface text-ink']).toBeFalse();
    });

    it('returns error class for error variant', () => {
      const result = component.panelClass({ id: '3', message: 'Fail', variant: 'error' });
      expect(result['border-border bg-error-bg text-error']).toBeTrue();
      expect(result['border-border bg-surface text-ink']).toBeFalse();
    });
  });
});
