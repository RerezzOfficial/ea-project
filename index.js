const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir); // Buat folder jika belum ada
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Konfigurasi multer untuk menyimpan file ke folder 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Simpan di folder public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file berdasarkan timestamp
  },
});
const upload = multer({ storage: storage });

const accountsFile = path.join(__dirname, "accounts.json");
const productsFile = path.join(__dirname, "products.json");

// Middleware untuk memeriksa login
function requireLogin(req, res, next) {
  if (req.cookies && req.cookies.loggedIn) {
    next(); // Lanjutkan ke rute berikutnya jika sudah login
  } else {
    res.redirect("/login"); // Arahkan ke halaman login jika belum login
  }
}

// Rute halaman utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rute halaman login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Rute halaman admin (dengan autentikasi)
app.get("/admin", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Proses login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (fs.existsSync(accountsFile)) {
    const accounts = JSON.parse(fs.readFileSync(accountsFile, "utf8"));
    const user = accounts.find(
      (account) => account.username === username && account.password === password
    );

    if (user) {
      res.cookie("loggedIn", true, { httpOnly: true }); // Set cookie login
      res.redirect("/admin.html");
    } else {
      res.status(401).send("Login gagal. Periksa username dan password Anda.");
    }
  } else {
    res.status(500).send("Data akun tidak ditemukan.");
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("loggedIn");
  res.redirect("/login.html");
});

// Mendapatkan semua produk
app.get("/api/products", (req, res) => {
  if (fs.existsSync(productsFile)) {
    const products = JSON.parse(fs.readFileSync(productsFile, "utf8"));
    res.json(products);
  } else {
    res.json([]);
  }
});

const fs = require("fs");
const path = require("path");

app.post("/api/products", requireLogin, upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Foto produk wajib diunggah!" });
    }

    // Pindahkan file dari /tmp ke public/uploads
    const tempPath = path.join("/tmp", req.file.filename);
    const targetPath = path.join(__dirname, "public", "uploads", req.file.filename);

    // Pindahkan file
    fs.renameSync(tempPath, targetPath);

    // Membuat produk baru dari form data
    const newProduct = {
      id: Date.now().toString(),
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      whatsapp: req.body.whatsapp,
      telegram: req.body.telegram,
      photo: req.file.filename, // Menyimpan nama file yang dipindahkan
    };

    let products = [];
    if (fs.existsSync(productsFile)) {
      products = JSON.parse(fs.readFileSync(productsFile, "utf8"));
    }

    products.push(newProduct);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    res.status(201).json({ message: "Produk berhasil ditambahkan!" });
  } catch (error) {
    console.error("Terjadi kesalahan saat menambahkan produk:", error);
    res.status(500).json({ message: "Gagal menambahkan produk!" });
  }
});

app.delete("/api/products/:id", requireLogin, (req, res) => {
  const productId = req.params.id;

  if (fs.existsSync(productsFile)) {
    let products = JSON.parse(fs.readFileSync(productsFile, "utf8"));

    const productIndex = products.findIndex((product) => product.id === productId);

    if (productIndex !== -1) {
      const deletedProduct = products.splice(productIndex, 1)[0];
      fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

      if (deletedProduct.photo) {
        const photoPath = path.join(__dirname, "public", "uploads", deletedProduct.photo);
        fs.unlinkSync(photoPath); 
      }

      res.json({ message: "Produk berhasil dihapus!" });
    } else {
      res.status(400).json({ message: "ID produk tidak valid!" });
    }
  } else {
    res.status(404).json({ message: "Produk tidak ditemukan!" });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
