import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { RightsService } from './rights.service';

export const rightsGuard: CanActivateFn = (route, _state) => {
  const cont: string | undefined = route.data?.['cont'];
  const view: string | undefined = route.data?.['view'];

  if (!cont || !view) return true; // no rights data on route — allow through

  const rightsService = inject(RightsService);
  const router = inject(Router);

  return rightsService.getPermission(cont, view).pipe(
    map(perm => {
      if (perm.charAt(0) === 'Y') return true;
      return router.createUrlTree(['/unauthorized'], { queryParams: { cont, view } });
    })
  );
};
