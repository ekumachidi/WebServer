// loadComponents.js
async function loadComponent(containerId, url, callback) {
  const container = document.getElementById(containerId);
  if (container) {
      try {
          const response = await fetch(url);
          const html = await response.text();
          container.innerHTML = html;

          // Run the callback if provided, to initialize JS for this component
          if (callback) {
              callback();
          }
          if (containerId === "header-container") {
            loadStatusBarScript();
          }
      } catch (error) {
          console.error(`Error loading component from ${url}:`, error);
      }
  }
}

// Function to initialize the side menu toggle after loading the header
function initializeMenuToggle() {
  // Toggle Side Menu
  $("#menu-toggle").on("click", function() {
      $("#side-menu").toggleClass("active");
      $("#content-wrapper").toggleClass("active");
      $("#overlay").toggleClass("active");
  });

  // Close Side Menu when clicking outside
  $("#overlay").on("click", function() {
      $("#side-menu").removeClass("active");
      $("#content-wrapper").removeClass("active");
      $(this).removeClass("active");
  });
}

function loadStatusBarScript() {
  const script = document.createElement("script");
  script.src = "/includes/statusbar.js?v=1";
  document.body.appendChild(script);
}

// Load each component, with the toggle callback for the header
loadComponent("header-container", "/components/header.html", initializeMenuToggle);
loadComponent("subheader-container", "/components/subheader.html");
loadComponent("sidemenu-container", "/components/side-menu.html");
loadComponent("footer-container", "/components/footer.html");
