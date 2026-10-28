const STORAGE_KEY = 'kaswaroeng_transactions_v1';

const initialData = [
    { id: 1, nama: 'Febrian', tanggal: '2026-10-12', kategori: 'Pinjaman', jumlah: 50000, keterangan: 'Beli Makan' },
    { id: 2, nama: 'Febrian', tanggal: '2026-10-20', kategori: 'Pemasukan', jumlah: 30000, keterangan: 'Bayar Hutang' },
    { id: 3, nama: 'Tukang', tanggal: '2026-10-20', kategori: 'Pengeluaran', jumlah: 75000, keterangan: 'Bayar Tukang' }
];

// Fungsi pembantu untuk mengurutkan transaksi dari tanggal terbaru ke terlama
function sortTransactions(data) {
    return data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

export function getTransaksi() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        const sortedInitial = sortTransactions(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedInitial));
        return sortedInitial;
    }
    return sortTransactions(JSON.parse(saved));
}

export function saveTransaksi(data) {
    const sortedData = sortTransactions(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedData));
}

export function addTransaksi(item) {
    const current = getTransaksi();
    item.id = Date.now();
    current.push(item);
    saveTransaksi(current);
    return getTransaksi();
}

export function deleteTransaksi(id) {
    let current = getTransaksi();
    current = current.filter(item => item.id !== id);
    saveTransaksi(current);
    return current;
}

// FUNGSI HAPUS SEMUA DENGAN BERSIH
export function deleteAllTransaksi() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}