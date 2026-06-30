let GLOBAL_REG_OPEN = true;
let CURRENT_USER = null;

// Fungsi untuk mengganti tampilan section/halaman
function switchView(sectionId) {
  // Sembunyikan semua section dengan class step-view
  const sections = document.querySelectorAll('.step-view');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Tampilkan section yang dituju
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// Fungsi validasi saat menekan tombol daftar
function tryToRegister() {
  if (GLOBAL_REG_OPEN) {
    switchView('formSection');
  } else {
    // Tampilkan modal pendaftaran ditutup menggunakan bootstrap
    const closedModal = new bootstrap.Modal(document.getElementById('closedRegistrationModal'));
    closedModal.show();
  }
}

// Pengalihan kontak admin via WhatsApp
function redirectToWhatsApp() {
  window.open('https://wa.me/61234567890', '_blank'); // Ganti dengan nomor WhatsApp aktif madrasah Anda
}

// Fungsi simulasi loading overlay
function showLoading(show, text = "Sedang memproses data...") {
  const overlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  if (overlay) {
    loadingText.innerText = text;
    overlay.style.display = show ? 'flex' : 'none';
  }
}

// Fungsi penanganan submit formulir pendaftaran siswa baru
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  
  if (!form.checkValidity()) {
    event.stopPropagation();
    form.classList.add('was-validated');
    return;
  }

  showLoading(true, "Menyimpan data pendaftaran...");
  
  // Simulasi sukses pasca submit data
  setTimeout(() => {
    showLoading(false);
    alert("Pendaftaran Berhasil! Silakan masuk ke panel menggunakan NISN Anda.");
    form.reset();
    form.classList.remove('was-validated');
    switchView('loginSection');
  }, 2000);
}

// Fungsi simulasi login
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  
  showLoading(true, "Memverifikasi akun...");

  setTimeout(() => {
    showLoading(false);
    if (username.toLowerCase() === 'admin') {
      switchView('adminDashboardSection');
    } else {
      switchView('studentDashboardSection');
      // Set contoh teks data siswa di dashboard
      document.getElementById('viewNama').innerText = "Calon Siswa MA Al Istiqomah";
      document.getElementById('viewNisn').innerText = username;
    }
  }, 1500);
}

// Fungsi set status buka/tutup pendaftaran dari panel admin
function setStatusReg(status) {
  const ann = document.getElementById('statusAnnouncement');
  if (status === 'ON') {
    GLOBAL_REG_OPEN = true;
    ann.style.display = 'block';
    ann.className = 'alert alert-success';
    ann.innerHTML = '<strong>Informasi:</strong> Pendaftaran Online Sistem Penerimaan Murid Baru Berstatus <strong>BUKA</strong>.';
  } else {
    GLOBAL_REG_OPEN = false;
    ann.style.display = 'block';
    ann.className = 'alert alert-danger';
    ann.innerHTML = '<strong>Informasi:</strong> Pendaftaran Online Telah <strong>DITUTUP</strong>.';
  }
}

// Fungsi logout sistem
function logout() {
  showLoading(true, "Keluar dari sistem...");
  setTimeout(() => {
    showLoading(false);
    switchView('homeSection');
  }, 1000);
}
