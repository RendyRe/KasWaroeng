/**
 * Menghitung ringkasan data finansial KasWaroeng (Opsi B - Pinjaman Memotong Saldo)
 * @param {Array} listTransaksi 
 * @returns {Object} Total Saldo, Pemasukan, Pengeluaran, Pinjaman
 */
export function hitungRingkasan(listTransaksi) {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    let totalPinjaman = 0;

    listTransaksi.forEach(item => {
        const jumlah = Number(item.jumlah) || 0;
        const kategori = item.kategori ? item.kategori.trim().toLowerCase() : '';
        
        if (kategori === 'pemasukan') {
            totalPemasukan += jumlah;
        } else if (kategori === 'pengeluaran') {
            totalPengeluaran += jumlah;
        } else if (kategori === 'pinjaman') {
            totalPinjaman += jumlah;
        } else if (kategori === 'bayar pinjaman') {
            totalPinjaman -= jumlah; // Mengurangi sisa pinjaman
        }
    });

    if (totalPinjaman < 0) totalPinjaman = 0;

    // Rumus Opsi B: Total Saldo = Pemasukan - Pengeluaran - Pinjaman
    const totalSaldo = totalPemasukan - totalPengeluaran - totalPinjaman;

    return {
        totalSaldo,
        totalPemasukan,
        totalPengeluaran,
        totalPinjaman
    };
}

/**
 * Format angka ke format Rupiah (contoh: Rp. 50.000)
 */
export function formatRupiah(val) {
    return 'Rp. ' + new Intl.NumberFormat('id-ID').format(val);
}

// Daftar 12 nama peminjam tetap (Urut Abjad)
export const DAFTAR_PEMINJAM = [
    'Aldi', 'Andri', 'Anweri', 'Aqiqi', 'Febrian', 'Huda', 
    'Muiz', 'Prahan', 'Rehan', 'Rizal', 'Saka', 'Sudar'
];

/**
 * Menghitung sisa pinjaman khusus untuk 12 nama tetap
 * @param {Array} listTransaksi 
 * @returns {Array} List 12 nama dengan sisa pinjaman masing-masing
 */
export function hitungRekap12Peminjam(listTransaksi) {
    const mapPinjaman = {};

    // Inisialisasi awal 0 untuk 12 nama
    DAFTAR_PEMINJAM.forEach(nama => {
        mapPinjaman[nama.toLowerCase()] = 0;
    });

    // Hitung transaksi pinjaman & bayar pinjaman
    listTransaksi.forEach(item => {
        if (!item.nama) return;
        
        const namaKey = item.nama.trim().toLowerCase();
        const jumlah = Number(item.jumlah) || 0;
        const kategori = item.kategori ? item.kategori.trim().toLowerCase() : '';

        if (mapPinjaman.hasOwnProperty(namaKey)) {
            if (kategori === 'pinjaman') {
                mapPinjaman[namaKey] += jumlah;
            } else if (kategori === 'bayar pinjaman') {
                mapPinjaman[namaKey] -= jumlah;
            }
        }
    });

    // Return array data 12 nama dengan nama asli
    return DAFTAR_PEMINJAM.map((nama, index) => {
        const sisa = mapPinjaman[nama.toLowerCase()] || 0;
        return {
            no: index + 1,
            nama,
            sisaPinjaman: sisa < 0 ? 0 : sisa
        };
    });
}