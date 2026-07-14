//======================================================================
//========================CONSTANTE ET VARIABLE=========================
//======================================================================
const API_URL = "http://localhost:5678/api";

//======================================================================
//============PHOTO ET DESCRIPTION DES PROJET===========================
//======================================================================

let allWork = [];

async function fetchData(endPoint) {
    const response = await fetch(`${API_URL}/${endPoint}`);

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();
}

async function getDataAllWork() {
    try {
        allWork = await fetchData("works");
        drawPhoto(allWork);
        drawModalGallery(allWork);
    } catch (error) {
        console.error(error.message);
    }
}

function drawPhoto(works) {
    const baliseGallery = document.querySelector(".gallery"); //parent

    if(!baliseGallery) return; // Condition de secu

    baliseGallery.innerHTML = "";

    works.forEach(work => {
        const figure = document.createElement("figure");//nouveaux element html
        const img = document.createElement("img");
        const caption = document.createElement("figcaption");

        img.src = work.imageUrl;
        img.alt = work.title;
        caption.textContent = work.title;

        figure.appendChild(img);//ajoute l enfant aux parent
        figure.appendChild(caption);
        baliseGallery.appendChild(figure);
    });
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
                const filteredWorks = allWork.filter(work => work.categoryId === id);//nouveaux tableau avec le bon id
                drawPhoto(filteredWorks);
            }
        });
    });
}

//======================================================================
//=====================CATEGORIES DES PROJETS===========================
//======================================================================

//fonction getDataCategorie
async function getDataCategories() {
    try {
        const categories = await fetchData("categories");
        drawCategories(categories);
    } catch (error) {
        console.error(error.message);
    }
}

function drawCategories(categories) {
    const baliseCategory = document.querySelector(".category");

    if(!baliseCategory) return;

    const btnAll = document.createElement("button");
    btnAll.textContent = "Tout";
    btnAll.dataset.id = "0"; 
    baliseCategory.appendChild(btnAll);

    categories.forEach(categorie => {
        const baliseFiltre = document.createElement("button");
        baliseFiltre.textContent = categorie.name;
        baliseFiltre.dataset.id = categorie.id; 
        baliseCategory.appendChild(baliseFiltre);

        //Menu déroulant de la modal
        modalCategorie(categorie)
    });
    
    buttonFilter();

}

//======================================================================
//==========================CONNEXION===================================
//======================================================================
const loginForm = document.querySelector("#login-form");

if(loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        login(email, password);
    });
}

async function login(email, password) {
    
    const errorMessage = document.getElementById("login-error-message");
    
    errorMessage.textContent = "";

    try {
        const response = await fetch(`${API_URL}/users/login`, {
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
        
        localStorage.setItem("token", data.token);

        window.location.href = "index.html";

    } catch (error) {
        errorMessage.textContent = error.message;
        console.error(error.message);
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

        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.href = "#";
            loginLink.addEventListener("click", () => {
                localStorage.removeItem("token");

                const modal = document.querySelector("#modal");
                if (modal) { closeModal(); }

                window.location.reload();
            });
        }

        if (editionMode) { editionMode.style.display = "flex"; }
        if (editBtn) { editBtn.style.display = "inline-flex"; }

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

const modal = document.querySelector("#modal");
const editBtn = document.querySelector("#btn-edit-portfolio");
const closeBtn = document.querySelectorAll(".close-modal");
const modalGalery = document.querySelector(".modal-gallery")

if (editBtn) {
    editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openModal();
    });
}

closeBtn.forEach(button => {
    button.addEventListener("click", () =>{
        closeModal();
    })
})

window.addEventListener("click", (event) => {
    const modalContent = document.querySelector(".modal-wrapper");
    
    if (modal.style.display === "flex" && modalContent && !modalContent.contains(event.target)) {
        console.log("Clic à l'extérieur détecté : fermeture");
        closeModal();
    }
})

function drawModalGallery(works) {
    const modalGallery = document.querySelector(".modal-gallery");

    if(!modalGallery) return;

    modalGallery.innerHTML = ""; 

    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can", "delete-icon");
        
        img.src = work.imageUrl;
        img.alt = work.title;

        figure.appendChild(img);
        figure.appendChild(icon);
        modalGallery.appendChild(figure);

        icon.addEventListener("click", () => {
            deleteWork(work.id);
        });
    });
}

async function deleteWork(id) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            console.log("Projet supprimé avec succès");
            allWork = allWork.filter(work => work.id !== id);
            
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

function openModal() {
    modal.style.display = "flex";
}

function closeModal() {

    modal.style.display = "none";

    resetAddForm();

    resetModalView();
}

//======================================================================
//======================== BOITE MODALE AJOUT ==========================
//======================================================================


const openAddFormBtn = document.querySelector("#open-add-form");
const modalGalleryView = document.querySelector("#modal-view-gallery");
const modalAddView = document.querySelector("#modal-view-add");

if (openAddFormBtn) {
    openAddFormBtn.addEventListener("click", () => {
        
        modalGalleryView.style.display = "none";
        
        modalAddView.style.display = "block";
    });
}

const backToGallery = document.getElementById("back-to-gallery")

if (backToGallery) {
    backToGallery.addEventListener("click", () => {
        modalGalleryView.style.display = "block";
        modalAddView.style.display = "none";

        resetAddForm();
    })
    
}

const inputImage = document.getElementById("image");
const previewImage = document.getElementById("preview-image");
const labelUpload = document.querySelector(".custom-file-upload");
const defaultIcon = document.getElementById("default-icon");
const infoCapcity = document.querySelector(".info-capacity");

if(inputImage){
    inputImage.addEventListener("change", () => {
        const file = inputImage.files[0];
        
        if (file) {
            previewImage.src = URL.createObjectURL(file);
            previewImage.classList.remove("hidden");
            
            offPlaceholder();
        }
    });
}

function offPlaceholder() {
    defaultIcon.classList.add("hidden");
    labelUpload.classList.add("hidden");
    infoCapcity.classList.add("hidden");
}

function resetAddForm() {
    previewImage.classList.add("hidden");
    defaultIcon.classList.remove("hidden");
    labelUpload.classList.remove("hidden");
    infoCapcity.classList.remove("hidden");
    previewImage.src = "#";
    inputImage.value = "";
    document.getElementById("add-work-form").reset();
}

function resetModalView() {
    const modalGalleryView = document.getElementById("modal-view-gallery");
    const modalAddView = document.getElementById("modal-view-add");
    
    modalGalleryView.style.display = "block";
    modalAddView.style.display = "none";
}

function modalCategorie(pCategorie) {
    const selectCategory = document.querySelector("#category");
    const option = document.createElement("option");
    option.value = pCategorie.id;
    option.textContent = pCategorie.name;
    selectCategory.appendChild(option)
}

//======================================================================
//=================== AJOUT DES TRAVAUX GALERIE ========================
//======================================================================
async function addElement() {

    const addWorkForm = document.getElementById("add-work-form");

    if(!addWorkForm) return;

    addWorkForm.addEventListener("submit", async (e) => {
        e.preventDefault(); //empeche le rechargement de la page
        const token = localStorage.getItem("token");
        const formData = new FormData(addWorkForm); //important

        try {
            const response = await fetch(`${API_URL}/works`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const newWork = await response.json();
                
                allWork.push(newWork);
                drawPhoto(allWork);
                drawModalGallery(allWork);
                
                closeModal();
                addWorkForm.reset();
            } else {
                alert("Erreur lors de l'ajout du projet.");
            }
        } catch (error) {
            console.error("Erreur serveur :", error);
        }
    })
}

//======================================================================
//=================== APPEL DES DIFFERENTES FONCTION ===================
//======================================================================
checkAdminStatus();
getDataAllWork();
getDataCategories();
addElement();
