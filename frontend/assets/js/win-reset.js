

const winNotification = document.getElementById("has-won")
const resetButton = document.getElementById("reset-button");


async function checkWin() {
    await timeout(2)
    console.log("checkWin")
    if(winNotification&&!winNotification.classList.contains("hidden")){
        return;
    }
    //check rows
    let rowNumber = 0;
    const firstElement = document.getElementById("G00")
    let rowFirstItem = firstElement;
    while (rowFirstItem) {
        let rowIsAllSelected = true;
        let checkItem = rowFirstItem;
        let index = 0;
        while (checkItem) {
            if (!checkItem.classList.contains("selected")) {
                rowIsAllSelected = false;
            }
            index += 1;
            checkItem = document.getElementById("G" + index + rowNumber)
        }
        if (rowIsAllSelected) {
            executeWin();
            return;
        }
        rowNumber += 1;
        rowFirstItem = document.getElementById("G0" + rowNumber)
    }
    //check columns
    let colNumber = 0;
    const firstColEleent = document.getElementById("G00")
    let colFirstItem = firstColEleent;
    while (colFirstItem) {
        let rowIsAllSelected = true;
        let checkItem = colFirstItem;
        let index = 0;
        while (checkItem) {
            if (!checkItem.classList.contains("selected")) {
                rowIsAllSelected = false;
            }
            index += 1;
            checkItem = document.getElementById("G" + colNumber + index)
        }
        if (rowIsAllSelected) {
            executeWin();
            return;
        }
        colNumber += 1;
        colFirstItem = document.getElementById("G" + colNumber + "0")
    }

    //diagonal
    let index = 0;
    let maxIndex = 0;
    let testElement = firstElement;
    let diagonalDownAllSelected = true;
    //left top to right bottom
    while(testElement){
        maxIndex = index;
        if (!testElement.classList.contains("selected")) {
            diagonalDownAllSelected = false;
        }
        index+=1;
        testElement = document.getElementById("G" + index.toString()+ index.toString())
    }
    if(diagonalDownAllSelected){
        executeWin();
            return;
    }
    index = 0;
    testElement = document.getElementById("G" + index.toString()+maxIndex.toString());
    let diagonalUpAllSelected = true;
    //left bottom left to top right
    while(testElement){
        if (!testElement.classList.contains("selected")) {
            diagonalUpAllSelected = false;
        }
        index+=1;
        maxIndex -=1;
        testElement = document.getElementById("G" + index.toString()+ maxIndex.toString())
    }
    if(diagonalUpAllSelected){
        executeWin();
            return;
    }
}

checkWin()

function resetSelection(){
    winNotification.classList.add("hidden")
    document.querySelectorAll(".grid-item").forEach(e =>e.classList.contains("no-deselect")? null:e.classList.remove("selected"))
    localStorage.removeItem("currentGameValueIds")
    localStorage.removeItem("currentGameSelectedValueIds")
    __w(()=>{initValues(true)})
}

function executeWin() {
    try {
        winNotification.classList.remove("hidden")
        var end = Date.now() + (3 * 1000);

        // go Buckeyes!
        var colors = ['#bb0000', '#ffffff'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    } catch (e) {
       console.log(e)
    }
}
function timeout(time) {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, time)
    })
}


resetButton.addEventListener("click",resetSelection)
document.querySelectorAll(".grid-item").forEach(e => e.addEventListener("click", () => { checkWin(e) }))