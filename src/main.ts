// FitTrack — Main Application Entry Point
// AI-Powered Fitness Tracker with Stitch High-Tech UI & Responsive Layout

import './style.css';
import { router, type Route } from './router';
import {
  IconBolt,
  IconDashboard,
  IconDumbbell,
  IconCamera,
  IconChart,
  IconSettings,
  IconUser,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconArrowUpRight,
} from './icons';
import { getProfile, getInitials, syncWithBackend } from './storage';
import { getAccessToken } from './api';
import { renderHomePage, initHomePage } from './pages/home';
import { renderExercisePage, initExercisePage } from './pages/exercise';
import { renderCalibrationPage, initCalibrationPage, stopCalibration } from './pages/calibration';
import { renderWorkoutPage, initWorkoutPage } from './pages/workout';
import { renderSummaryPage, initSummaryPage } from './pages/summary';
import { renderProgressPage, initProgressPage } from './pages/progress';
import { renderProfilePage, initProfilePage } from './pages/profile';
import { renderLoginPage, initLoginPage } from './pages/login';
import { renderRegisterPage, initRegisterPage } from './pages/register';
import { renderOnboardingPage, initOnboardingPage } from './pages/onboarding';

// App root
const app = document.getElementById('app')!;

// Sidebar Collapsed State Persistence (localStorage)
const SIDEBAR_STORAGE_KEY = 'fittrack_sidebar_collapsed';

function isSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // Ignore storage quota/security errors
  }
  const sidebar = document.getElementById('app-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  if (collapsed) {
    app.classList.add('app-root--sidebar-collapsed');
    sidebar?.classList.add('app-sidebar--collapsed');
    if (toggleBtn) {
      toggleBtn.innerHTML = IconChevronRight(16, 'currentColor');
      toggleBtn.setAttribute('title', 'Buka Sidebar (Ctrl+B)');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Buka Sidebar');
    }
  } else {
    app.classList.remove('app-root--sidebar-collapsed');
    sidebar?.classList.remove('app-sidebar--collapsed');
    if (toggleBtn) {
      toggleBtn.innerHTML = IconChevronLeft(16, 'currentColor');
      toggleBtn.setAttribute('title', 'Tutup Sidebar (Ctrl+B)');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Tutup Sidebar');
    }
  }
}

// Navigation Items definition with clean luxury SVG icons
const getNavItems = () => [
  { label: 'Dashboard', iconSvg: IconDashboard(18), route: '/' as Route },
  { label: 'Program Latihan', iconSvg: IconDumbbell(18), route: '/exercise' as Route },
  { label: 'Live Workout HUD', iconSvg: IconCamera(18), route: '/workout/live' as Route, hasDot: true },
  { label: 'Analisis & Progress', iconSvg: IconChart(18), route: '/progress' as Route },
  { label: 'Pengaturan & Profil', iconSvg: IconSettings(18), route: '/profile' as Route },
];

// Desktop Sidebar Navigation (Dark Athletic Aesthetic & Collapsible)
function renderSidebar(activeRoute: Route): string {
  const navItems = getNavItems();
  const collapsed = isSidebarCollapsed();

  return `
    <aside class="app-sidebar ${collapsed ? 'app-sidebar--collapsed' : ''}" id="app-sidebar" aria-label="Navigasi Utama">
      <!-- Brand Logo Header & Toggle Button -->
      <div class="sidebar-header-wrapper">
        <a href="#/" class="sidebar-brand-box" title="FitTrack Athletic AI">
          <div class="sidebar-brand-logo">
            ${IconBolt(20, '#9EF01A')}
          </div>
          <div class="sidebar-brand-text">
            <span class="brand-name">FitTrack</span>
            <span class="brand-tag">ATHLETIC AI</span>
          </div>
        </a>
        <button
          type="button"
          class="sidebar-toggle-btn"
          id="sidebar-toggle-btn"
          aria-label="${collapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}"
          title="${collapsed ? 'Buka Sidebar (Ctrl+B)' : 'Tutup Sidebar (Ctrl+B)'}"
          aria-expanded="${collapsed ? 'false' : 'true'}"
        >
          ${collapsed ? IconChevronRight(16, 'currentColor') : IconChevronLeft(16, 'currentColor')}
        </button>
      </div>

      <!-- Quick Section Eyebrow -->
      <div class="sidebar-eyebrow">
        <span>// NAVIGATION</span>
      </div>

      <!-- Menu Items -->
      <nav class="sidebar-nav-menu" aria-label="Menu Aplikasi">
        ${navItems.map(item => {
          const isActive = activeRoute === item.route || (item.route === '/' && activeRoute === '/dashboard');
          return `
            <a
              href="#${item.route}"
              class="sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}"
              data-route="${item.route}"
              title="${item.label}"
            >
              <span class="sidebar-item-icon">${item.iconSvg}</span>
              <span class="sidebar-item-label">${item.label}</span>
              ${item.hasDot ? '<span class="sidebar-live-dot">● LIVE</span>' : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Bottom Engine Status Badge -->
      <div class="sidebar-bottom-status">
        <div class="sbs-header">
          <span class="sbs-eyebrow">// VISION ENGINE</span>
          <span class="sbs-tag">READY</span>
        </div>
        <div class="sbs-detail">
          ${IconBolt(14, '#9EF01A')}
          <span>60 FPS Real-time Tracker</span>
        </div>
        <a href="#/exercise" class="btn-sidebar-quick-start">
          <span>Mulai Sesi</span>
          ${IconArrowRight(14, 'currentColor')}
        </a>
      </div>
    </aside>
  `;
}

// Mobile Drawer Navigation (for small screens)
function renderMobileDrawer(activeRoute: Route): string {
  const navItems = getNavItems();

  return `
    <div class="mobile-drawer-overlay" id="mobile-drawer-overlay"></div>
    <aside class="mobile-drawer" id="mobile-drawer" aria-label="Menu Mobile" role="dialog" aria-modal="true">
      <div class="mobile-drawer-header">
        <div class="mobile-brand">
          <div class="sidebar-brand-logo">
            ${IconBolt(20, '#9EF01A')}
          </div>
          <div class="sidebar-brand-text">
            <span class="brand-name">FitTrack</span>
            <span class="brand-tag">ATHLETIC AI</span>
          </div>
        </div>
        <button class="mobile-drawer-close" id="mobile-drawer-close" aria-label="Tutup Menu" title="Tutup Menu (Esc)">
          ${IconX(18, 'currentColor')}
        </button>
      </div>

      <div class="drawer-eyebrow">// MENU NAVIGASI</div>

      <nav class="mobile-drawer-nav">
        ${navItems.map(item => {
          const isActive = activeRoute === item.route || (item.route === '/' && activeRoute === '/dashboard');
          return `
            <a
              href="#${item.route}"
              class="drawer-nav-item ${isActive ? 'drawer-nav-item--active' : ''}"
              data-route="${item.route}"
            >
              <span class="drawer-item-icon">${item.iconSvg}</span>
              <span class="drawer-item-label">${item.label}</span>
              ${item.hasDot ? '<span class="sidebar-live-dot">● LIVE</span>' : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <div class="mobile-drawer-footer">
        <a href="#/exercise" class="btn-drawer-cta" id="drawer-btn-start">
          <span>Mulai Latihan Sekarang</span>
          ${IconArrowRight(15, '#08090A')}
        </a>
        <div class="drawer-status-chip">
          <span>● AI POSE ENGINE ONLINE</span>
        </div>
      </div>
    </aside>
  `;
}

// Mobile Bottom Navigation
function renderBottomNav(activeRoute: Route): string {
  const tabs = [
    { id: 'home', iconSvg: IconDashboard(19), label: 'Dashboard', route: '/' as Route },
    { id: 'train', iconSvg: IconDumbbell(19), label: 'Latihan', route: '/exercise' as Route },
    { id: 'workout', iconSvg: IconCamera(19), label: 'Workout', route: '/workout/live' as Route },
    { id: 'stats', iconSvg: IconChart(19), label: 'Progress', route: '/progress' as Route },
    { id: 'profile', iconSvg: IconUser(19), label: 'Profil', route: '/profile' as Route },
  ];

  return `
    <nav class="mobile-bottom-nav" id="mobile-bottom-nav" aria-label="Navigasi Bawah">
      ${tabs.map(tab => {
        const isActive = activeRoute === tab.route;
        return `
          <button
            class="mobile-nav-item ${isActive ? 'mobile-nav-item--active' : ''}"
            data-route="${tab.route}"
          >
            <span class="mobile-nav-icon">${tab.iconSvg}</span>
            <span class="mobile-nav-label">${tab.label}</span>
          </button>
        `;
      }).join('')}
    </nav>
  `;
}

// Mobile Top Bar with Hamburger Menu
function renderMobileTopBar(): string {
  const profile = getProfile();
  const initials = getInitials(profile.name);

  return `
    <header class="mobile-top-bar">
      <div class="mobile-top-left">
        <button class="mobile-hamburger-btn" id="mobile-hamburger-btn" aria-label="Buka Menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        <a href="#/" class="mobile-brand">
          <span class="brand-bolt">${IconBolt(18, '#9EF01A')}</span>
          <span class="mobile-brand-title">FitTrack</span>
        </a>
      </div>
      <div class="mobile-top-actions">
        <a href="#/exercise" class="btn-mobile-workout-pill">
          <span>Latihan</span>
          ${IconArrowUpRight(12, 'currentColor')}
        </a>
        <a href="#/profile" class="mobile-profile-avatar-btn" title="Profil ${profile.name}">
          ${profile.avatarUrl ? `
            <img
              src="${profile.avatarUrl}"
              alt="${profile.name}"
              onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
            />
          ` : ''}
          <div class="mobile-avatar-initials" style="${profile.avatarUrl ? 'display:none;' : 'display:flex;'}">
            ${initials}
          </div>
        </a>
      </div>
    </header>
  `;
}

// Route classification
function isAuthRoute(route: Route): boolean {
  return route === '/login' || route === '/register' || route === '/onboarding';
}

function isFullscreenWorkout(route: Route): boolean {
  return route.startsWith('/workout/live') || route.startsWith('/workout/calibrate');
}

// Global escape key listener for mobile drawer
let drawerKeydownAttached = false;

// Master Page Renderer
function renderAppPage(content: string, route: Route): void {
  if (isAuthRoute(route)) {
    app.className = 'app-root app-root--auth';
    app.innerHTML = content;
    return;
  }

  if (isFullscreenWorkout(route)) {
    app.className = 'app-root app-root--fullscreen';
    app.innerHTML = content;
    return;
  }

  // Standard Desktop & Mobile App Layout with collapsible state
  const collapsed = isSidebarCollapsed();
  app.className = `app-root app-root--dashboard ${collapsed ? 'app-root--sidebar-collapsed' : ''}`;
  app.innerHTML = `
    ${renderSidebar(route)}
    <div class="app-body-wrapper">
      ${renderMobileTopBar()}
      <main class="app-main-viewport">
        ${content}
      </main>
      ${renderBottomNav(route)}
    </div>
    ${renderMobileDrawer(route)}
  `;

  // Attach Desktop Sidebar Toggle button listener
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  toggleBtn?.addEventListener('click', () => {
    setSidebarCollapsed(!isSidebarCollapsed());
  });

  // Attach mobile bottom nav listeners
  document.querySelectorAll('.mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-route') as Route;
      if (target) router.navigate(target);
    });
  });

  // Attach mobile hamburger and drawer listeners
  const hamburgerBtn = document.getElementById('mobile-hamburger-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const closeBtn = document.getElementById('mobile-drawer-close');

  const openDrawer = () => {
    drawer?.classList.add('mobile-drawer--open');
    overlay?.classList.add('mobile-drawer-overlay--visible');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer?.classList.remove('mobile-drawer--open');
    overlay?.classList.remove('mobile-drawer-overlay--visible');
    document.body.style.overflow = '';
  };

  hamburgerBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // Close drawer on Escape key or toggle sidebar with Ctrl+B / Cmd+B
  if (!drawerKeydownAttached) {
    drawerKeydownAttached = true;
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const currentDrawer = document.getElementById('mobile-drawer');
      const currentOverlay = document.getElementById('mobile-drawer-overlay');
      if (e.key === 'Escape' && currentDrawer?.classList.contains('mobile-drawer--open')) {
        currentDrawer.classList.remove('mobile-drawer--open');
        currentOverlay?.classList.remove('mobile-drawer-overlay--visible');
        document.body.style.overflow = '';
      }

      // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar on desktop
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(!isSidebarCollapsed());
      }
    });
  }

  document.querySelectorAll('.drawer-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      closeDrawer();
      const target = item.getAttribute('data-route') as Route;
      if (target) router.navigate(target);
    });
  });

  document.getElementById('drawer-btn-start')?.addEventListener('click', () => {
    closeDrawer();
  });
}

// Define routes
router
  .on('/', () => {
    renderAppPage(renderHomePage(), '/');
    initHomePage();
  })
  .on('/dashboard', () => {
    renderAppPage(renderHomePage(), '/');
    initHomePage();
  })
  .on('/login', () => {
    renderAppPage(renderLoginPage(), '/login');
    initLoginPage();
  })
  .on('/register', () => {
    renderAppPage(renderRegisterPage(), '/register');
    initRegisterPage();
  })
  .on('/onboarding', () => {
    renderAppPage(renderOnboardingPage(), '/onboarding');
    initOnboardingPage();
  })
  .on('/exercise', () => {
    renderAppPage(renderExercisePage(), '/exercise');
    initExercisePage();
  })
  .on('/workout/calibrate', () => {
    stopCalibration();
    renderAppPage(renderCalibrationPage(), '/workout/calibrate');
    initCalibrationPage();
  })
  .on('/workout/live', () => {
    renderAppPage(renderWorkoutPage(), '/workout/live');
    initWorkoutPage();
  })
  .on('/workout/summary', () => {
    renderAppPage(renderSummaryPage(), '/workout/summary');
    initSummaryPage();
  })
  .on('/progress', () => {
    renderAppPage(renderProgressPage(), '/progress');
    initProgressPage();
  })
  .on('/profile', () => {
    renderAppPage(renderProfilePage(), '/profile');
    initProfilePage();
  });

// Initial boot
if (!window.location.hash) {
  window.location.hash = '/';
}
router.start();

// Automatic cloud synchronization on launch if authenticated
if (getAccessToken()) {
  syncWithBackend().catch((err) => {
    console.debug('[FitTrack Boot] Background sync deferred:', err);
  });
}

