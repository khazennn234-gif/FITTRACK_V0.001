// FitTrack — Minimalist Luxury Toast Notification Utility
// Provides clean, non-intrusive tactile feedback for interactive actions

export function showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
  let container = document.getElementById('ft-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ft-toast-container';
    container.className = 'ft-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `ft-toast ft-toast--${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9EF01A" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : type === 'warning'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FACC15" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    : type === 'error'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `
    <span class="ft-toast-icon">${iconSvg}</span>
    <span class="ft-toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('ft-toast--visible');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('ft-toast--visible');
    setTimeout(() => {
      toast.remove();
    }, 280);
  }, 2800);
}
