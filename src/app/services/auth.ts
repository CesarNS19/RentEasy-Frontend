import { BehaviorSubject } from 'rxjs';
import axios from 'axios';
import Swal from 'sweetalert2';

const API = 'https://renteasy.space/auth/';

export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();

  private userSubject = new BehaviorSubject<string | null>(null);
  user$ = this.userSubject.asObservable();

  loginKey = 'renteasy_token';
  roleKey = 'renteasy_role';
  userKey = 'renteasy_user';
  expKey = 'renteasy_exp';
  userIdKey = 'renteasy_userId';

  private inactivityTimeout: any;
  private inactivityLimit = 10 * 60_000;

  constructor() {
    const storedRole = localStorage.getItem(this.roleKey);
    if (storedRole) this.roleSubject.next(storedRole.toLowerCase());

    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) this.userSubject.next(storedUser);

    this.checkSessionExpiration();
    this.startInactivityWatcher();
    this.setupActivityListeners();
  }

  private checkSessionExpiration() {
    const exp = localStorage.getItem(this.expKey);
    if (localStorage.getItem('rememberMe') === 'true') return;
    if (exp && Date.now() > parseInt(exp, 10)) {
      this.logout();
      Swal.fire({
        toast: true,
        icon: 'info',
        title: 'Sesión expirada',
        text: 'Por favor inicia sesión nuevamente',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  }

  private startInactivityWatcher() {
    if (localStorage.getItem('rememberMe') === 'true') return;
    this.clearInactivityTimeout();
    this.inactivityTimeout = setTimeout(() => {
      this.logout();
      Swal.fire({
        toast: true,
        icon: 'info',
        title: 'Sesión expirada',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }, this.inactivityLimit);
  }

  private clearInactivityTimeout() {
    if (this.inactivityTimeout) clearTimeout(this.inactivityTimeout);
  }

  private setupActivityListeners() {
    ['click', 'keydown', 'scroll', 'mousemove'].forEach((event) =>
      document.addEventListener(event, () => this.resetInactivityTimer())
    );
  }

  private resetInactivityTimer() {
    localStorage.setItem(this.expKey, (Date.now() + this.inactivityLimit).toString());
    this.startInactivityWatcher();
  }

  async login(username: string, password: string) {
    if (!username.trim() || !password.trim()) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'Por favor completa todos los campos',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return null;
    }

    try {
      const res = await axios.post(API + 'auth.php', { username, password });
      const data = res.data;
      const expireTime = Date.now() + this.inactivityLimit;

      localStorage.setItem(this.loginKey, data.token);
      localStorage.setItem(this.roleKey, data.role);
      localStorage.setItem(this.userKey, data.username);
      localStorage.setItem(this.userIdKey, data.id.toString());
      localStorage.setItem(this.expKey, expireTime.toString());

      this.userSubject.next(data.username);
      this.roleSubject.next(data.role.toLowerCase());
      this.startInactivityWatcher();

      Swal.fire({
        toast: true,
        icon: 'success',
        title: '¡Bienvenido!',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      return data;
    } catch {
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Usuario o contraseña incorrectos',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return null;
    }
  }

  async register(username: string, password: string, role: string) {
    if (!username.trim() || !password.trim() || !role.trim()) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'Todos los campos son obligatorios',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return null;
    }

    if (password.length < 8) {
      Swal.fire({
        toast: true,
        icon: 'info',
        title: 'La contraseña debe tener al menos 8 caracteres',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return null;
    }

    try {
      const res = await axios.post(API + 'register.php', { username, password, role });
      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Tu cuenta ha sido creada correctamente',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return res.data;
    } catch {
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'No se pudo registrar',
        text: 'Verifica los datos ingresados o intenta más tarde',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return null;
    }
  }

  logout() {
    localStorage.removeItem(this.loginKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.expKey);
    localStorage.removeItem(this.userIdKey);
    this.roleSubject.next(null);
    this.userSubject.next(null);
    this.clearInactivityTimeout();
    window.location.href = '/login';
  }

  getToken() {
    return localStorage.getItem(this.loginKey);
  }

  getRole() {
    return localStorage.getItem(this.roleKey)?.toLowerCase() ?? null;
  }

  getUser() {
    return localStorage.getItem(this.userKey);
  }

  getUserId() {
    const id = localStorage.getItem(this.userIdKey);
    return id ? parseInt(id, 10) : null;
  }

  getExp() {
    return localStorage.getItem(this.expKey);
  }
}

export const AuthServiceProvider = {
  provide: AuthService,
  useClass: AuthService,
};
