import { getTransaksi, addTransaksi, deleteTransaksi, deleteAllTransaksi } from './store.js';
import { hitungRingkasan, formatRupiah } from './calc.js';

// DOM Elements
const dispTotalSaldo = document.getElementById('dispTotalSaldo');
const dispTotalPengeluaran = document.getElementById('dispTotalPengeluaran');
const dispTotalPemasukan = document.getElementById('dispTotalPemasukan');
const dispTotalPinjaman = document.getElementById('dispTotalPinjaman');

const financeForm = document.getElementById('financeForm');
const inputNama = document.getElementById('inputNama');
const inputTanggal = document.getElementById('inputTanggal');
const inputKategori = document.getElementById('inputKategori');
const inputJumlah = document.getElementById('inputJumlah');
const inputKeterangan = document.getElementById('inputKeterangan');
const tableBody = document.getElementById('transactionTableBody');

// Sidebar Elements
const openDrawerBtn = document.getElementById('openDrawerBtn');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const drawerOverlay = document.getElementById('drawerOverlay');
const sidebarDrawer = document.getElementById('sidebarDrawer');

const btnDeleteAll = document.getElementById('btnDeleteAll');
const btnExportData = document.getElementById('btnExportData');
const exportModalOverlay = document.getElementById('exportModalOverlay');
const closeExportModalBtn = document.getElementById('closeExportModalBtn');
const inputNamaFileExport = document.getElementById('inputNamaFileExport');
const btnProsesExport = document.getElementById('btnProsesExport');

// Spreadsheet Modal Elements
const btnConnectSpreadsheet = document.getElementById('btnConnectSpreadsheet');
const spreadsheetModalOverlay = document.getElementById('spreadsheetModalOverlay');
const closeSpreadsheetModalBtn = document.getElementById('closeSpreadsheetModalBtn');
const inputSpreadsheetUrl = document.getElementById('inputSpreadsheetUrl');
const btnSaveSpreadsheetUrl = document.getElementById('btnSaveSpreadsheetUrl');

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDate();
    setupAmountFormatting();
    renderUI();
    setupEventListeners();
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    if (inputTanggal) inputTanggal.value = today;
}

function setupAmountFormatting() {
    if (!inputJumlah) return;
    inputJumlah.type = 'text';
    inputJumlah.placeholder = 'Jumlah (Rp)';

    inputJumlah.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value ? new Intl.NumberFormat('id-ID').format(value) : '';
    });
}

function formatDateDisplay(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
}

// FUNGSI SYNC KE GOOGLE SPREADSHEET (URUT TANGGAL & HAPUS TERKONEKSI)
function syncToSpreadsheet() {
    const url = localStorage.getItem('kaswaroeng_sheet_url');
    if (!url) return;

    const transactions = getTransaksi();

    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'syncAll',
            transactions: transactions
        })
    }).catch(err => console.error('Gagal sync ke Google Sheets:', err));
}

function renderUI() {
    const transactions = getTransaksi();
    const ringkasan = hitungRingkasan(transactions);

    dispTotalSaldo.textContent = formatRupiah(ringkasan.totalSaldo);
    dispTotalPengeluaran.textContent = formatRupiah(ringkasan.totalPengeluaran);
    dispTotalPemasukan.textContent = formatRupiah(ringkasan.totalPemasukan);
    dispTotalPinjaman.textContent = formatRupiah(ringkasan.totalPinjaman);

    tableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#5d6b82; padding: 20px;">Belum ada data transaksi</td></tr>`;
        return;
    }

    transactions.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nama}</td>
            <td>${formatDateDisplay(item.tanggal)}</td>
            <td>
                <span class="badge-category text-${item.kategori}">
                    <span class="square-dot dot-${item.kategori}"></span>
                    ${item.kategori}
                </span>
            </td>
            <td>${formatRupiah(item.jumlah)}</td>
            <td>${item.keterangan}</td>
            <td style="text-align: center;">
                <button class="btn-delete-item" data-id="${item.id}" title="Hapus">
                    <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function setupEventListeners() {
    // Form Submit (Tambah Transaksi)
    financeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawJumlah = inputJumlah.value.replace(/\./g, '');

        const newTransaksi = {
            id: Date.now(),
            nama: inputNama.value,
            tanggal: inputTanggal.value,
            kategori: inputKategori.value,
            jumlah: Number(rawJumlah),
            keterangan: inputKeterangan.value
        };

        addTransaksi(newTransaksi);
        financeForm.reset();
        setDefaultDate();
        renderUI();
        syncToSpreadsheet(); // Sync otomatis saat tambah data
    });

    // Hapus Single Transaksi
    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-delete-item');
        if (btn) {
            const id = Number(btn.dataset.id);
            if (confirm('Hapus baris transaksi ini?')) {
                deleteTransaksi(id);
                renderUI();
                syncToSpreadsheet(); // Sync otomatis saat hapus data
            }
        }
    });

    const toggleDrawer = (open) => {
        if (open) {
            sidebarDrawer.classList.add('open');
            drawerOverlay.classList.add('active');
        } else {
            sidebarDrawer.classList.remove('open');
            drawerOverlay.classList.remove('active');
        }
    };

    openDrawerBtn.addEventListener('click', () => toggleDrawer(true));
    closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
    drawerOverlay.addEventListener('click', () => toggleDrawer(false));

    // Export Handler
    btnExportData.addEventListener('click', () => {
        toggleDrawer(false);
        inputNamaFileExport.value = 'Data Keuangan Kas Bulan Oktober';
        exportModalOverlay.classList.add('active');
    });

    closeExportModalBtn.addEventListener('click', () => {
        exportModalOverlay.classList.remove('active');
    });

    btnProsesExport.addEventListener('click', () => {
        const fileName = inputNamaFileExport.value.trim() || 'Data_Kas_Bulanan';
        const data = getTransaksi();

        if (data.length === 0) {
            alert('Tidak ada data transaksi untuk diexport.');
            return;
        }

        let csvContent = "\uFEFF";
        csvContent += "No;Nama;Tanggal;Kategori;Jumlah (Rp);Keterangan\n";

        data.forEach((item, index) => {
            csvContent += `${index + 1};"${item.nama}";"${formatDateDisplay(item.tanggal)}";"${item.kategori}";${item.jumlah};"${(item.keterangan || '').replace(/"/g, '""')}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", url);
        downloadAnchor.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        exportModalOverlay.classList.remove('active');
    });

    // SPREADSHEET MODAL HANDLER
    btnConnectSpreadsheet.addEventListener('click', () => {
        toggleDrawer(false);
        inputSpreadsheetUrl.value = localStorage.getItem('kaswaroeng_sheet_url') || '';
        spreadsheetModalOverlay.classList.add('active');
    });

    closeSpreadsheetModalBtn.addEventListener('click', () => {
        spreadsheetModalOverlay.classList.remove('active');
    });

    btnSaveSpreadsheetUrl.addEventListener('click', () => {
        const url = inputSpreadsheetUrl.value.trim();
        if (url) {
            localStorage.setItem('kaswaroeng_sheet_url', url);
            alert('Link Google Spreadsheet berhasil disimpan!');
            syncToSpreadsheet();
        } else {
            localStorage.removeItem('kaswaroeng_sheet_url');
            alert('Koneksi Google Spreadsheet dihapus.');
        }
        spreadsheetModalOverlay.classList.remove('active');
    });

// Hapus Semua Data & Sync Langsung
    btnDeleteAll.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA DATA UANG KAS? Tindakan ini tidak bisa dibatalkan.')) {
            deleteAllTransaksi();
            renderUI();
            syncToSpreadsheet(); // Mengirim data kosong ke Spreadsheet
            toggleDrawer(false);
        }
    });
}