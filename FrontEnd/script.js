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
    drawModalGallery(allWork);

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

        //Transformer "login" en "logout"
        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.href = "#";
            loginLink.addEventListener("click", () => {
                localStorage.removeItem("token");
                window.location.reload();
            });
        }

        // Afficher les éléments d'administration
        if (editionMode) { editionMode.style.display = "flex"; }
        if (editBtn) { editBtn.style.display = "inline-flex"; }

        // Masquer la barre de filtres
        if (filterBar) {
            filterBar.style.display = "none";
        }
    } else {
        // --- MODE VISITEUR ---
        if (editBtn) {
            editBtn.style.display = "none";
        } 
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

function drawModalGallery(works) {
    const modalGallery = document.querySelector(".modal-gallery");
    modalGallery.innerHTML = ""; // Vide la galerie avant d'ajouter

    works.forEach(element => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can", "delete-icon");
        
        img.src = element.imageUrl;
        img.alt = element.title;

        figure.appendChild(img);
        figure.appendChild(icon);
        modalGallery.appendChild(figure);

        // Optionnel : ajouter l'événement de suppression ici
        icon.addEventListener("click", () => {
            deleteWork(element.id);
        });
    });
}

async function deleteWork(id) {
    const token = localStorage.getItem("token"); // Récupération du token stocké lors du login

    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`, // Envoi du token pour autorisation
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            // Suppression réussie : on met à jour l'interface
            console.log("Projet supprimé avec succès");
            
            // 1. Mettre à jour le tableau local allWork
            allWork = allWork.filter(work => work.id !== id);
            
            // 2. Redessiner les deux galeries
            drawPhoto(allWork);
            drawModalGallery(allWork);

        } else {
            console.error("Erreur lors de la suppression :", response.status);
            alert("Une erreur est survenue lors de la suppression.");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

//======================================================================
//====================FONCTION ADD WORK=================================
//======================================================================

async function addWork(formData) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData // On envoie directement le FormData
    });

    if (response.ok) {
        // Actualiser la galerie après ajout
        getDataAllWork(); 
    }
}

// Sélection des éléments de navigation dans la modale
const modalViewGallery = document.querySelector("#modal-view-gallery");
const addPhotoForm = document.querySelector("#add-photo-form");
const openAddFormBtn = document.querySelector("#open-add-form");

// Gestion du passage de la galerie au formulaire
openAddFormBtn.addEventListener("click", () => {
    modalViewGallery.style.display = "none";
    addPhotoForm.style.display = "flex";
    
    // On remplit le select des catégories dynamiquement
    fillCategorySelect();
});

// Fonction pour remplir le select des catégories
async function fillCategorySelect() {
    const select = document.querySelector("#add-photo-form #category");
    select.innerHTML = ""; // Vide les options existantes
    
    // On utilise les catégories déjà récupérées (ou un fetch si nécessaire)
    const url = "http://localhost:5678/api/categories";
    const response = await fetch(url);
    const categories = await response.json();
    
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

addPhotoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const formData = new FormData(addPhotoForm);
    
    // Appel à votre fonction existante
    await addWork(formData);
    
    // Réinitialisation de la modale
    modal.style.display = "none";
    addPhotoForm.style.display = "none";
    modalViewGallery.style.display = "block";
    addPhotoForm.reset();
});

function showGallery() {
    document.querySelector("#add-photo-form").style.display = "none";
    document.querySelector("#modal-view-gallery").style.display = "block";
}
//======================================================================
//====================APPEL DES DIFFERENTES FONCTION====================
//======================================================================
checkAdminStatus();
getDataAllWork()
getDataCategories()

