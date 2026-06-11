//======================================================================
//============PHOTO ET DESCRIPTION DES PROJET===========================
//======================================================================

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
    drawPhoto(result)

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
    console.log(result)
    //apell fonction
    drawCategories(result)

    } catch (error) {
        console.error(error.message);
    }
}

//Fonction creation des categorie et insertion dans le DOM
function drawCategories(categories){
    const baliseCategory = document.querySelector(".category")

    //creation balise tout
    const BaliseAll = document.createElement("button")
    BaliseAll.textContent = "Tout"
    baliseCategory.appendChild(BaliseAll)

    for (let i = 0; i < categories.length; i++) {
        const baliseFiltre = document.createElement("button");
        baliseFiltre.textContent = categories[i].name;
        baliseCategory.appendChild(baliseFiltre);
    }
}

//======================================================================
//=====================APPEL DES DIFERENTE FONCTION=====================
//======================================================================
getDataAllWork()
getDataCategories()

