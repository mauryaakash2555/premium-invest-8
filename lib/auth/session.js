/**
 * Session Management (client-side)
 * Auto-logout after 30 minutes of inactivity
 */

export class SessionManager {
  constructor({ timeoutMinutes = 30, onLogout } = {}) {
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    this.onLogout = typeof onLogout === "function" ? onLogout : () => {};
    this.lastActivity = Date.now();
    this.timer = null;
    this.active = false;
  }

  login() {
    this.active = true;
    this.lastActivity = Date.now();
    this.startTimer();
  }

  activity() {
    if (!this.active) return;
    this.lastActivity = Date.now();
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.active) return;
      if (Date.now() - this.lastActivity > this.timeoutMs) {
        this.logout();
      }
    }, 60_000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  logout() {
    this.active = false;
    this.stopTimer();
    try {
      this.onLogout();
    } catch {
      // ignore
    }
  }

  isLoggedIn() {
    return this.active && Date.now() - this.lastActivity < this.timeoutMs;
  }
}
