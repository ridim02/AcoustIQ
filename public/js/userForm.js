function encrypt(text) {
    return btoa(text.toString());
  }
  
  function decrypt(text) {
    return atob(text);
  }
  
  function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }
  
  async function fetchUserData(id) {
    try {
      const response = await fetch(`/users/${id}`);
      const user = await response.json();
      
      document.getElementById("first_name").value = user.first_name;
      document.getElementById("last_name").value = user.last_name;
      document.getElementById("email").value = user.email;
      document.getElementById("role").value = user.role;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const encryptedId = getQueryParam("userId");
    const userForm = document.getElementById("userForm");
  
    if (encryptedId) {
      const userId = decrypt(encryptedId);
      fetchUserData(userId);
    }
  
    userForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        email: document.getElementById("email").value,
        role: document.getElementById("role").value,
      };
  
      const method = encryptedId ? "PUT" : "POST";
      const url = encryptedId ? `/users/${decrypt(encryptedId)}` : "/users";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        window.location.href = "dashboard.html";
      } else {
        console.error("Error submitting form");
      }
    });
  });
  