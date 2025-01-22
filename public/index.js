document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("productList");
    const productModal = document.getElementById("productModal");
    const closeModal = document.querySelector(".close");

    const showProductDetail = (product) => {
        document.getElementById("modalProductName").textContent = product.name;
        document.getElementById("modalProductImage").src = product.photo; // Foto ditampilkan langsung dalam format Base64
        document.getElementById("modalProductPrice").textContent = `Rp ${product.price}`;
        document.getElementById("modalProductDescription").textContent = product.description;

        const whatsappLink = document.getElementById("whatsappLink");
        const telegramLink = document.getElementById("telegramLink");

        const whatsappSpan = document.getElementById("modalProductWhatsapp");
        const telegramSpan = document.getElementById("modalProductTelegram");

        whatsappSpan.textContent = product.whatsapp;
        whatsappLink.href = `https://wa.me/${product.whatsapp}`;

        telegramSpan.textContent = product.telegram;
        telegramLink.href = `https://t.me/${product.telegram}`;

        productModal.style.display = "block";
    };

    const response = await fetch("/api/products");
    const products = await response.json();

    products.forEach((product) => {
        const li = document.createElement("li");
        li.classList.add('product-item');

        const img = document.createElement("img");
        img.src = product.photo; // Menampilkan gambar dalam format Base64
        img.alt = product.name;
        li.appendChild(img);

        const productInfo = document.createElement("div");
        productInfo.classList.add('product-info');

        const productName = document.createElement("div");
        productName.classList.add('product-name');
        productName.textContent = product.name;
        productInfo.appendChild(productName);

        const productPrice = document.createElement("div");
        productPrice.classList.add('product-price');
        productPrice.textContent = `Rp ${product.price}`;
        productInfo.appendChild(productPrice);

        li.appendChild(productInfo);

        li.addEventListener("click", () => {
            showProductDetail(product);
        });

        productList.appendChild(li);
    });

    closeModal.addEventListener("click", () => {
        productModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === productModal) {
            productModal.style.display = "none";
        }
    });
});
