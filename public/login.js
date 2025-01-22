document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    const result = await response.json();
    const errorMessage = document.getElementById("errorMessage");
  
    if (result.success) {
      window.location.href = "/admin";
    } else {
      errorMessage.textContent = result.message;
    }
  };
  