let values = []
let currentGameValueIds = [];
let currentGameSelectedValueIds = [];

function toggle(e) {
    const winNotification = document.getElementById("has-won");
    if (currentGameValueIds.length === 0 || winNotification && !winNotification.classList.contains("hidden")) {
        return;
    }
    e.classList.contains("no-deselect") ? null : e.classList.toggle("selected")
    if(e.classList.contains("selected")){
        if(currentGameSelectedValueIds.indexOf(e.id)<=0){ //add if not added
            currentGameSelectedValueIds.push(e.id);
        } 
    }else{
        currentGameSelectedValueIds = currentGameSelectedValueIds.filter(f=>f!==e.id)
    }
    saveLocalValues()
}
document.querySelectorAll(".grid-item").forEach(e => e.addEventListener("click", () => { toggle(e) }))

async function init() {
    const localValues = localStorage.getItem("values");
    if (localValues !== null) { //use values of local storage first
        try {
            values = JSON.parse(localValues);
        } catch (e) {
            console.log(e)
        }

    } else {
        await fetchValues();
    }
    const localCurrentGameValueIds = localStorage.getItem("currentGameValueIds");
    if (localCurrentGameValueIds !== null) { //use values of local storage first
        currentGameValueIds = JSON.parse(localCurrentGameValueIds);

    }
    console.log("Current",localCurrentGameValueIds,currentGameValueIds.length,currentGameValueIds.length === 0)
    const localCurrentGameSelectedValueIds = localStorage.getItem("currentGameSelectedValueIds");
    if (localCurrentGameSelectedValueIds !== null ) { //use values of local storage first
        currentGameSelectedValueIds = JSON.parse(localCurrentGameSelectedValueIds);

    }
    
        initValues(false);
    


}
init();

async function fetchValues() {
    const response = await fetch('./bingo-values.json');
    values = await response.json()
    localStorage.setItem("values", JSON.stringify(values));

}

async function initValues(forceSettingNewValues=false) {

    let fieldsToFill = Array.from(document.querySelectorAll(".grid-item"));
    let id = 0;
    document.querySelectorAll(".no-deselect").forEach(e=>{e.innerHTML = "Joker"})
    if(forceSettingNewValues!==true&&currentGameValueIds.length>0){
        while (fieldsToFill.length > 0){
            const element = fieldsToFill.pop()
            if(!element.classList.contains("no-deselect") &&currentGameValueIds[id]!==undefined &&values[currentGameValueIds[id]]!==undefined){
                element.innerHTML = values[currentGameValueIds[id]].plain;
               if(element.id&&currentGameSelectedValueIds.length>0&&currentGameSelectedValueIds.indexOf(element.id)>=0){
                    element.classList.add("selected")
                }

                id+=1;
            }
            
        }
        saveLocalValues();
        scaleText(".grid-item")
        return;
    }
    currentGameValueIds = [];
    currentGameSelectedValueIds=[];
    if (values.length < 1) {
        console.error("ERROR: no values!")
        return;
    }
    const tempSelectedValuesToPreventDuplicates = [];
 
    while (fieldsToFill.length > 0) {
        const currentElementToFill = fieldsToFill.pop();
        if (!currentElementToFill.classList.contains("no-deselect"))  {
            let idOfUniqueValue = null;
            while (idOfUniqueValue === null) {
                const randomIndex = getRandomInt(1, Object.keys(values).length) - 1;
                if (tempSelectedValuesToPreventDuplicates.indexOf(randomIndex) <= 0 && !!values[randomIndex]) {
                    tempSelectedValuesToPreventDuplicates.push(randomIndex);
                    idOfUniqueValue = randomIndex;
                }

            }
            try {
                currentElementToFill.innerHTML = `${values[idOfUniqueValue].plain}`
            } catch (e) {
                console.log(e)
            }
        }
    }
    currentGameValueIds = tempSelectedValuesToPreventDuplicates;
    saveLocalValues();
    scaleText(".grid-item")

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scaleText(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(async (e) => {
        while (isOverflown(e)) {
            var style = window.getComputedStyle(e, null).getPropertyValue('font-size');
            var fontSize = parseFloat(style);
            e.style.fontSize = (fontSize - 2) + 'px';
        }
    })
}

addEventListener("resize", (event) => {
    document.querySelectorAll(".grid-item").forEach(e => e.style.fontSize = "15px")
    scaleText(".grid-item")
});

function isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function saveLocalValues() {
    localStorage.setItem("currentGameValueIds", JSON.stringify(currentGameValueIds))
    localStorage.setItem("currentGameSelectedValueIds", JSON.stringify(currentGameSelectedValueIds))
}