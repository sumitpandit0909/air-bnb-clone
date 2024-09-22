const burger = document.getElementById("burger");
const navLinks = document.querySelector(".nav-links");

burger.addEventListener("click", () => {
  if (navLinks.style.display === "flex") {
    navLinks.style.display = "none"; // Hide menu
  } else {
    navLinks.style.display = "flex"; // Show menu
  }
  burger.classList.toggle("toggle");
});
