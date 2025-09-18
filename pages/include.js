// js/include.js
async function includeHTML(id, file) {
  let response = await fetch(file);
  let text = await response.text();
  document.getElementById(id).innerHTML = text;

  // highlight active menu
  let current = window.location.pathname.split("/").pop();
  document.querySelectorAll("nav a").forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
}

window.onload = () => {
  includeHTML("header", "header.html");
  includeHTML("footer", "footer.html");
};

