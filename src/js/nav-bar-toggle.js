let navBar = document.querySelector(".doc-nav");
let navButton = document.getElementById("packages-nav-button");

if (!document.body.classList.contains("package-nav-open")) {
    navButton.classList.add("arrow-down");
}

function open() {
    document.body.classList.add("package-nav-open");
    navButton.classList.remove("arrow-down");
}

function close() {
    document.body.classList.remove("package-nav-open");
    navButton.classList.add("arrow-down");
}

navButton.addEventListener("click", function (event) {
    if (window.innerWidth > 930) {
        if (document.body.classList.contains("package-nav-open")) {
            close();
        } else {
            open();
        }

        event.preventDefault();
        return false;
    }
});