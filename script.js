const menu = document.querySelector(".menu");
let lastScrollPosition = window.scrollY;

window.addEventListener("scroll", () => {
    const currentScrollPosition = window.scrollY;

    if (currentScrollPosition > lastScrollPosition) {
        // El usuario se está desplazando hacia abajo, oculta el menú
        menu.classList.add("hidden");
    } else {
        // El usuario se está desplazando hacia arriba, muestra el menú
        menu.classList.remove("hidden");
    }

    lastScrollPosition = currentScrollPosition;
});
