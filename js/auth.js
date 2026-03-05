document.getElementById("loginForm")
.addEventListener("submit", async function (e) {

  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "dashboard.html";
});
