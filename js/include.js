async function includeHTML(id, file) {
  let response = await fetch(file);
  let text = await response.text();
  document.getElementById(id).innerHTML = text;

  // highlight active menu
  const currentFile = window.location.pathname.split("/").pop();
  document.querySelectorAll("nav a").forEach(link => {
    const href = link.getAttribute("href");
    if (href.endsWith(currentFile)) {
      link.classList.add("active");
    }
  });
}

window.onload = () => {
  // Detect if we are in pages/ folder or root
  const currentPath = window.location.pathname;
  const isRoot = currentPath.endsWith("index.html") || currentPath.endsWith("/");

  const headerPath = isRoot ? "includes/header.html" : "../includes/header.html";
  const footerPath = isRoot ? "includes/footer.html" : "../includes/footer.html";

  includeHTML("header", headerPath);
  includeHTML("footer", footerPath);
};
