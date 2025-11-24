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
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  modalInstance: any;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.loadUser();

    const modalEl = document.getElementById('editProfileModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }
  }

  async loadUser() {
    try {
      const userId = this.auth.getUserId();
      if (!userId) return;

      const res = await fetch(`http://localhost:8081/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${this.auth.getToken()}` }
      });

      if (!res.ok) throw new Error('No se pudo cargar el usuario');

      const data = await res.json();

      this.user = {
        username: data.username,
        imageUrl: data.imageUrl || null
      };

      this.username = this.user.username;
      this.imagePreview = this.user.imageUrl;

    } catch (err: any) {
      Swal.fire({
        toast: true,
        icon: 'error',
        title: err.message,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
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
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.imageFile);
    } else {
      this.imageFile = null;
      this.imagePreview = this.user.imageUrl || null;
    }
  }

  async save() {
  const formData = new FormData();
  formData.append('username', this.username);

  // Solo enviar password si se escribió algo nuevo
  if (this.password.trim()) {
    formData.append('password', this.password.trim());
  }

  if (this.imageFile) {
    formData.append('image', this.imageFile);
  }

  try {
    const res = await fetch(`http://localhost:8081/users/${this.auth.getUserId()}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.auth.getToken()}`
      },
      body: formData
    });

    if (!res.ok) throw new Error('Error al actualizar usuario');

    Swal.fire({
      toast: true,
      icon: 'success',
      title: 'Perfil actualizado',
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false
    });

    localStorage.setItem('renteasy_user', this.username);
    if (this.imageFile && this.imagePreview) {
      localStorage.setItem('userImage', this.imagePreview as string);
    }

    this.loadUser();
    this.modalInstance?.hide();
    this.password = '';
    this.imageFile = null;

  } catch (e: any) {
    Swal.fire({
      toast: true,
      icon: 'error',
      title: e.message,
      position: 'top-end',
      timer: 2500,
      showConfirmButton: false
    });
  }
}

}
