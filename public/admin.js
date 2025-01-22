document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("productList");
    const addProductForm = document.getElementById("addProductForm");

    const loadProducts = async () => {
        productList.innerHTML = ""; // Kosongkan daftar produk
        const response = await fetch("/api/products");
        const products = await response.json();

        products.forEach((product) => {
            const li = document.createElement("li");
            li.textContent = `${product.name} - Rp${product.price}`;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Hapus";
            deleteButton.style.marginLeft = "10px";

            // Fungsi hapus produk
            deleteButton.addEventListener("click", async () => {
                const confirmDelete = confirm("Apakah Anda yakin ingin menghapus produk ini?");
                if (confirmDelete) {
                    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
                    loadProducts(); // Perbarui daftar setelah produk dihapus
                }
            });

            li.appendChild(deleteButton);
            productList.appendChild(li);
        });
    };

    addProductForm.addEventListener("submit", async (e) => {
        e.preventDefault();

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

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("whatsapp", whatsapp);
        formData.append("telegram", telegram);
        formData.append("photo", photo);

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                addProductForm.reset();
                loadProducts(); // Perbarui daftar produk
            } else {
                const error = await response.json();
                alert(`Gagal menambahkan produk: ${error.message}`);
            }
        } catch (error) {
            alert("Terjadi kesalahan saat mengirim data produk.");
        }
    });

    loadProducts();
});
