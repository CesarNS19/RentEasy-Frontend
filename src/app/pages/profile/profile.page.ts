import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {

  user: any;
  username: string = '';
  password: string = '';
  telefono : string = '';
  email : string = '';
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  modalInstance: any;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.loadUser();
    const modalEl = document.getElementById('editProfileModal');
    if (modalEl) this.modalInstance = new bootstrap.Modal(modalEl);
  }

  async loadUser() {
    try {
      const userId = this.auth.getUserId();
      if (!userId) return;

      const res = await fetch(`https://renteasy.space/profile/update.php?id=${userId}`, { method: 'GET' });
      if (!res.ok) throw new Error('No se pudo cargar el usuario');

      const data = await res.json();
      this.user = {
        username: data.data.username,
        telefono : data.data.telefono,
        email : data.data.email,
        imageUrl: data.data.image_url || null
      };

      this.username = this.user.username;
      this.telefono = this.user.telefono;
      this.email = this.user.email;
      this.imagePreview = this.user.imageUrl;

    } catch (err: any) {
      Swal.fire({ toast: true, icon: 'error', title: err.message, position: 'top-end', showConfirmButton: false, timer: 2500 });
    }
  }

  openModal() {
    this.modalInstance?.show();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.imageFile);
    } else {
      this.imageFile = null;
      this.imagePreview = this.user.imageUrl || null;
    }
  }

  async save() {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('telefono', this.telefono);
    formData.append('email', this.email);
    if (this.password.trim()) formData.append('password', this.password.trim());
    if (this.imageFile) formData.append('image', this.imageFile);

    try {
      const res = await fetch(`https://renteasy.space/profile/update.php?id=${this.auth.getUserId()}`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Error al actualizar usuario');

      const data = await res.json();
      if (!data.success) throw new Error('No se pudo actualizar usuario');

      Swal.fire({ toast: true, icon: 'success', title: 'Perfil actualizado', position: 'top-end', timer: 2000, showConfirmButton: false });

      localStorage.setItem('renteasy_user', this.username);

      this.modalInstance?.hide();
      this.password = '';
      this.imageFile = null;

      await this.loadUser();

      if (this.user?.imageUrl) {
        this.user.imageUrl = `${this.user.imageUrl}?t=${Date.now()}`;
        this.imagePreview = this.user.imageUrl;
        localStorage.setItem('userImage', this.imagePreview ? this.imagePreview.toString() : '');
      }

    } catch (e: any) {
      Swal.fire({ toast: true, icon: 'error', title: e.message, position: 'top-end', timer: 2500, showConfirmButton: false });
    }
  }
}
