let values = []
let currentGameValueIds = [];
let currentGameSelectedValueIds = [];

function toggle(e) {
    const winNotification = document.getElementById("has-won");
    if (currentGameValueIds.length === 0 || winNotification && !winNotification.classList.contains("hidden")) {
        return;
    }
    e.classList.contains("no-deselect") ? null : e.classList.toggle("selected")
    if (e.classList.contains("selected")) {
        if (currentGameSelectedValueIds.indexOf(e.id) < 0) { //add if not added
            currentGameSelectedValueIds.push(e.id);
        }
    } else {
        currentGameSelectedValueIds = currentGameSelectedValueIds.filter(f => f !== e.id)
    }
    saveLocalValues()
    updateUrl()
    updateShareButtons()
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
    console.log("Current", localCurrentGameValueIds, currentGameValueIds.length, currentGameValueIds.length === 0)
    const localCurrentGameSelectedValueIds = localStorage.getItem("currentGameSelectedValueIds");
    if (localCurrentGameSelectedValueIds !== null) { //use values of local storage first
        currentGameSelectedValueIds = JSON.parse(localCurrentGameSelectedValueIds);
    }
    
    initValues(false);
    updateShareButtons();
    document.getElementById("link-share").addEventListener("click",()=>{
        navigator.clipboard.writeText(window.location.href);
        alert("Link in die Zwischenablage kopiert.")
    })
}
init();

function get_map(s) {
    d = {}
    for (var i = 0; i < s.length; i++) {
        d[s.charAt(i)] = i
    }
    d.length = s.length
    d._s = s
    return d
}

var separate_with = '.';
var encodable = get_map('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_'); // - is reserved for negatives obviously :-P
var base10 = get_map('0123456789')

function baseconvert(number, fromdigits, todigits) {
    var number = String(number)
    // make an integer out of the number
    var x = 0
    for (var i = 0; i < number.length; i++) {
        var digit = number.charAt(i)
        x = x * fromdigits.length + fromdigits[digit]
    }
    // create the result in base 'todigits.length'
    res = ""
    while (x > 0) {
        remainder = x % todigits.length
        res = todigits._s.charAt(remainder) + res
        x = parseInt(x / todigits.length)
    }
    return res
}

function encodeNums(L) {
    var r = []
    for (var i = 0; i < L.length; i++) {
        r.push(baseconvert(L[i], base10, encodable))
    }
    return r.join(separate_with)
}

function decodeNums(s) {
    var r = []
    var s = s.split(separate_with)
    for (var i = 0; i < s.length; i++) {
        r.push(parseInt(baseconvert(s[i], encodable, base10)))
    }
    return r
}

async function updateUrl() {
    const mappedValues = currentGameSelectedValueIds.map(e => parseInt(e.replace("G", "")))
    let currentGameSelectedValueIdsEncoded = encodeNums(mappedValues)
    let currentGameValueIdsEncoded = encodeNums(currentGameValueIds)
    console.log(currentGameSelectedValueIds, currentGameSelectedValueIdsEncoded, currentGameValueIds, currentGameValueIdsEncoded)
    const url = new URL(window.location.href);
    url.searchParams.set('s', currentGameSelectedValueIdsEncoded);
    url.searchParams.set('g', currentGameValueIdsEncoded);

    // url.searchParams.delete('param2');
    window.history.replaceState(null, null, url); // or pushState

    
}

async function updateShareButtons(){
    await __w(()=>document.querySelectorAll(".share-button"))
    document.querySelectorAll(".share-button").forEach(e=>{
        if(e.hasAttribute("data-base")){
            console.log(e.getAttribute("data-base")+encodeURIComponent(window.location.href ))
            e.setAttribute("href",e.getAttribute("data-base")+encodeURIComponent(window.location.href ))
        }
        console.log(e)
    })
    
    
}



async function fetchValues() {
    const response = await fetch('./bingo-values.json');
    values = await response.json()
    localStorage.setItem("values", JSON.stringify(values));

}

async function initValues(forceSettingNewValues = false) {

    let fieldsToFill = Array.from(document.querySelectorAll(".grid-item"));
    let id = 0;
    document.querySelectorAll(".no-deselect").forEach(e => { e.innerHTML = "Joker" })
    if (forceSettingNewValues !== true && currentGameValueIds.length > 0) {
        while (fieldsToFill.length > 0) {
            const element = fieldsToFill.pop()
            if (!element.classList.contains("no-deselect") && currentGameValueIds[id] !== undefined && values[currentGameValueIds[id]] !== undefined) {
                element.innerHTML = values[currentGameValueIds[id]].plain;
                if (element.id && currentGameSelectedValueIds.length > 0 && currentGameSelectedValueIds.indexOf(element.id) >= 0) {
                    element.classList.add("selected")
                }

                id += 1;
            }

        }
        saveLocalValues();
        scaleText(".grid-item")
        return;
    }
    currentGameValueIds = [];
    currentGameSelectedValueIds = [];
    if (values.length < 1) {
        console.error("ERROR: no values!")
        return;
    }
    const tempSelectedValuesToPreventDuplicates = [];

    while (fieldsToFill.length > 0) {
        const currentElementToFill = fieldsToFill.pop();
        if (!currentElementToFill.classList.contains("no-deselect")) {
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
