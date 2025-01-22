document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("productList");
    const addProductForm = document.getElementById("addProductForm");

    // Fungsi untuk memuat produk
    const loadProducts = async () => {
        productList.innerHTML = ""; // Kosongkan daftar produk
        const response = await fetch("/api/products");
        const products = await response.json();

        products.forEach((product, index) => {
            const li = document.createElement("li");
            li.textContent = `${product.name} - Rp${product.price}`;

            // Tombol hapus
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Hapus";
            deleteButton.style.marginLeft = "10px";

            // Fungsi hapus produk
            deleteButton.addEventListener("click", async () => {
                await fetch(`/api/products/${index}`, { method: "DELETE" });
                loadProducts(); // Perbarui daftar setelah produk dihapus
            });

            li.appendChild(deleteButton);
            productList.appendChild(li);
        });
    };

    // Fungsi untuk menambah produk
    addProductForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Ambil data dari form
        const name = document.getElementById("name").value;
        const price = document.getElementById("price").value;
        const description = document.getElementById("description").value;
        const whatsapp = document.getElementById("whatsapp").value;
        const telegram = document.getElementById("telegram").value;
        const photo = document.getElementById("photo").files[0];

        if (!photo) {
            alert("Foto produk wajib diunggah!");
            return;
        }

        // Buat form data untuk menangani file upload
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("whatsapp", whatsapp);
        formData.append("telegram", telegram);
        formData.append("photo", photo);

        try {
            // Kirim data produk ke server
            const response = await fetch("/api/products", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                addProductForm.reset(); // Reset form setelah tambah
                loadProducts(); // Perbarui daftar produk
            } else {
                const error = await response.json();
                alert(`Gagal menambahkan produk: ${error.message}`);
            }
        } catch (error) {
            alert("Terjadi kesalahan saat mengirim data produk.");
        }
    });

    // Muat daftar produk saat halaman dimuat
    loadProducts();
});
