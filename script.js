// Konfigurasi Google Spreadsheet
const SPREADSHEET_ID = "1ih-MTo7037_qp4CJgP6wxULXb4m8nB5oYf0QV3BpgDs";
// Catatan: Jika menggunakan Google Apps Script Web App, tempel URL Web App Anda di bawah ini
const SCRIPT_URL = ""; 

let GLOBAL_REG_OPEN = true;
let CURRENT_USER = null;

// Fungsi untuk mengganti tampilan section/halaman
function switchView(sectionId) {
  const sections = document.querySelectorAll('.step-view');
  sections.forEach(section => {
    section.classList.remove('active');
  });

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
    const closedModal = new bootstrap.Modal(document.getElementById('closedRegistrationModal'));
    closedModal.show();
  }
}

// Pengalihan kontak admin via WhatsApp
function redirectToWhatsApp() {
  window.open('https://wa.me/61234567890', '_blank'); // Ganti dengan nomor WhatsApp riil
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

  showLoading(true, "Menyimpan data pendaftaran ke database...");
  
  // Ambil semua data dari form
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.spreadsheetId = SPREADSHEET_ID; // Menyertakan ID Spreadsheet jika diproses lewat API

  // Simulasi pengiriman data (Jika sudah ada SCRIPT_URL, gunakan fetch() ke Apps Script)
  setTimeout(() => {
    showLoading(false);
    alert("Pendaftaran Berhasil dimasukkan ke database! Silakan masuk menggunakan NISN Anda.");
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
