// FitTrack — SPA Router
// Hash-based router supporting desktop & mobile navigation

export type Route =
  | '/'
  | '/dashboard'
  | '/login'
  | '/register'
  | '/onboarding'
  | '/exercise'
  | '/workout/calibrate'
  | '/workout/live'
  | '/workout/summary'
  | '/progress'
  | '/profile';

type RouteHandler = (params?: Record<string, string>) => void;

class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private currentRoute: Route = '/';
  private onRouteChange?: (route: Route, prevRoute: Route) => void;

  constructor() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  on(path: string, handler: RouteHandler): Router {
    this.routes.set(path, handler);
    return this;
  }

  onChange(callback: (route: Route, prevRoute: Route) => void): Router {
    this.onRouteChange = callback;
    return this;
  }

  navigate(path: Route): void {
    window.location.hash = path;
  }

  getCurrentRoute(): Route {
    return this.currentRoute;
  }

  private handleRoute(): void {
    const rawHash = window.location.hash.slice(1) || '/';
    // Normalize /dashboard to /
    const hash = rawHash === '/dashboard' ? '/' : rawHash;
    const prevRoute = this.currentRoute;
    this.currentRoute = hash as Route;

    const handler = this.routes.get(hash);
    if (handler) {
      handler();
    } else {
      // Fallback to home
      this.navigate('/');
    }

    if (this.onRouteChange) {
      this.onRouteChange(this.currentRoute, prevRoute);
    }
  }

  start(): void {
    this.handleRoute();
  }
}

export const router = new Router();
