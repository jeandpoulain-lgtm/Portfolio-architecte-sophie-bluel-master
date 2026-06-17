//======================================================================
//============PHOTO ET DESCRIPTION DES PROJET===========================
//======================================================================
let allWork = []

//fonction getDataAllWork (reponse en json)
async function getDataAllWork() {
    const url = "http://localhost:5678/api/works"
    try {
        const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    
    //appel fonction
    allWork = result;
    drawPhoto(allWork);

    } catch (error) {
        console.error(error.message);
    }
}

//fonction insertion dans le DOM pour affichage
function drawPhoto(json) {
    const baliseGallery = document.querySelector(".gallery");
    baliseGallery.innerHTML = "";

    json.forEach(element => {
        //je cree les elements
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const caption = document.createElement("figcaption");

        img.src = element.imageUrl;
        img.alt = element.title;
        caption.textContent = element.title;

        //insertion dans le DOM
        figure.appendChild(img);
        figure.appendChild(caption);
        baliseGallery.appendChild(figure);
    });
}

//======================================================================
//=====================CATEGORIES DES PROJETS===========================
//======================================================================

//fonction getDataCategorie
async function getDataCategories() {
    const url = "http://localhost:5678/api/categories"
    try {
        const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    
    //apell fonction
    drawCategories(result)
    buttonFilter()

    } catch (error) {
        console.error(error.message);
    }
}

//Fonction creation des categorie et insertion dans le DOM
function drawCategories(categories) {
    const baliseCategory = document.querySelector(".category");

    // Bouton "Tout" (ID = 0 par convention)
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tout";
    btnAll.dataset.id = "0"; 
    baliseCategory.appendChild(btnAll);

    categories.forEach(categorie => {
        const baliseFiltre = document.createElement("button");
        baliseFiltre.textContent = categorie.name;
        baliseFiltre.dataset.id = categorie.id; 
        baliseCategory.appendChild(baliseFiltre);
    });
    
    buttonFilter();
}

//======================================================================
//==========================BOUTON FILTRES==============================
//======================================================================
function buttonFilter(){
    const mesBoutons = document.querySelectorAll(".category button");
    mesBoutons.forEach(bouton => {
        bouton.addEventListener("click", (event) => {
            const id = parseInt(event.target.dataset.id);
            if (id === 0 ) {
                drawPhoto(allWork);
            }else {
                const filteredWorks = allWork.filter(work => work.categoryId === id);
                drawPhoto(filteredWorks);
            }
        });
    });
}

//======================================================================
//==========================CONNEXION===================================
//======================================================================
const loginForm = document.querySelector("#login-form");

if(loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        //ont enleve l'evenement par default(f5) 
        event.preventDefault();
        //recuperation element formulaire
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Appel à la fonction de connexion
        login(email, password);
    });
}

async function login(email, password) {
    try {
        //recup dans l API 
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error("Erreur dans l'identifiant ou le mot de passe");
        }

        const data = await response.json();
        
        // Stockage du token dans le localStorage pour maintenir la session
        localStorage.setItem("token", data.token);

        // Redirection vers la page d'accueil après succès
        window.location.href = "index.html";

    } catch (error) {
        console.error(error.message);
        // Affichez l'erreur à l'utilisateur dans le DOM
    }
}

function checkAdminStatus() {
    const token = localStorage.getItem("token");
    const loginLink = document.querySelector('nav ul li a[href="login.html"]');
    const filterBar = document.querySelector(".category");
    const editionMode = document.querySelector(".editionMode");
    const editBtn = document.querySelector("#btn-edit-portfolio");

    if (token) {
        // --- MODE ADMIN ---

        // 1. Transformer "login" en "logout"
        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.href = "#";
            loginLink.addEventListener("click", () => {
                localStorage.removeItem("token");
                window.location.reload();
            });
        }

        // 2. Afficher les éléments d'administration
        if (editionMode) editionMode.style.display = "flex";
        if (editBtn) editBtn.style.display = "inline-flex"; // ou "block" selon votre CSS

        // 3. Masquer la barre de filtres
        if (filterBar) {
            filterBar.style.display = "none";
        }
    } else {
        // --- MODE VISITEUR ---
        
        // Assurer que le bouton modifier est bien masqué
        if (editBtn) editBtn.style.display = "none";
    }
}

//======================================================================
//========================BOITE MODALE==================================
//======================================================================
// Sélection des éléments
const modal = document.querySelector("#modal");
const editBtn = document.querySelector("#btn-edit-portfolio");
const closeBtn = document.querySelector(".close-modal");
const modalGalery = document.querySelector(".modal-gallery")

// Ouvrir la modale
if (editBtn) {
    editBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });
}

// Fermer la modale
if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

// Fermer si on clique en dehors de la zone blanche
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

//======================================================================
//=====================APPEL DES DIFERENTE FONCTION=====================
//======================================================================
checkAdminStatus();
getDataAllWork()
getDataCategories()

