import { getTransaksi } from './store.js';
import { hitungRingkasan, formatRupiah, hitungRekap12Peminjam } from './calc.js';

document.addEventListener('DOMContentLoaded', () => {
    const dispTotalSemuaPinjaman = document.getElementById('dispTotalSemuaPinjaman');
    const tableBody = document.getElementById('peminjamPageTableBody');

    // Ambil data transaksi terbaru dari localStorage
    const transactions = getTransaksi();

    // 1. Hitung & Tampilkan Total Semua Pinjaman
    const ringkasan = hitungRingkasan(transactions);
    if (dispTotalSemuaPinjaman) {
        dispTotalSemuaPinjaman.textContent = formatRupiah(ringkasan.totalPinjaman);
    }

    // 2. Render Tabel 12 Nama Peminjam (Urut A-Z)
    const dataPeminjam = hitungRekap12Peminjam(transactions);
    tableBody.innerHTML = '';

    dataPeminjam.forEach(item => {
        const tr = document.createElement('tr');
        const isZero = item.sisaPinjaman === 0;

        tr.innerHTML = `
            <td><strong>${item.nama}</strong></td>
            <td style="text-align: right;">
                ${isZero 
                    ? `<span style="color: var(--text-muted);">Rp. 0</span>` 
                    : `<span class="orange-text" style="font-weight: 700;">${formatRupiah(item.sisaPinjaman)}</span>`
                }
            </td>
        `;
        tableBody.appendChild(tr);
    });
});