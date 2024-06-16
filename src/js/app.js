import "../css/app.css";

const currency = {
    "Allied Seals": 4000,
    "Centurio Seals": 4000,
    Nuts: 4000,
    Poetics: 2000,
    Causality: 2000,
    Comedy: 2000,
    Aesthetics: 2000,
    Heliometry: 2000,
}
const currencyToEmotes = {
    'Allied Seals': '<:alliedseal:711080429775749170>',
    'Centurio Seals': '<:centurioseal:711080444728311898>',
    'Nuts': '<:nutsack:711074430910070837>',
    'Poetics': '<:poetics:711074456386142240>',
    'Causality': '<:Causality:1013952874646081586>',
    'Comedy': '<:Comedy:1110805833270444103>',
    'Aesthetics': 'Aesthetics',
    'Heliometry': 'Heliometry',
}
let expansions = {
    ARR: {
        "Allied Seals": 40,
        "Centurio Seals": 20,
        Poetics: 30,
        Aesthetics: 10,
    },
    HW: {
        "Centurio Seals": 40,
        Poetics: 30,
        Aesthetics: 10,
    },
    SB: {
        "Centurio Seals": 40,
        Poetics: 30,
        Aesthetics: 10,
    },
    SHB: {
        Nuts: 40,
        Poetics: 30,
        Aesthetics: 10,
    },
    EW: {
        Nuts: 40,
        Poetics: 30,
        Aesthetics: 10,
    },
    DT: {
        Nuts: 40,
        Poetics: 30,
        Aesthetics: 20,
        //Heliometry: 10,
    }
};

const swapCurrencyWithEmotes = function(macroStr) {
    for(let key in currencyToEmotes) {
        macroStr = macroStr.replace(key, currencyToEmotes[key])
    }
    return macroStr
}

let updateMacros = function (frm) {
    let myCurrencies = {};
    let myExps = [];

    // Clear any existing error messages
    let errorDiv = document.getElementById("divErrorMessage");
    errorDiv.innerHTML = "";
    errorDiv.classList.add("hidden");

    let exps = frm.querySelectorAll('input[type="checkbox"]:checked');
    if (exps.length > 0) {
        exps.forEach((el) => {
            myExps.push(el.value);
            if (el.value in expansions) {
                let expCurrencies = expansions[el.value];
                for (let curr in expCurrencies) {
                    if (!(curr in myCurrencies)) {
                        // Initialize total currency to 0 if it doesn't exist yet
                        myCurrencies[curr] = 0;
                    }
                    // Find number of marks for the current expansion
                    let mobCount = parseInt(document.getElementById("txtCount" + el.value).value ?? 0);
                    myCurrencies[curr] += expCurrencies[curr] * mobCount;
                }
            }
        });
        //Find out which mode they want
        let genMode = document.querySelector('input[name="displayMode"]:checked');
        generateMacroText(myCurrencies, genMode.value ?? "caps");
    } else {
        showError("You must select at least one expansion for this to work!");
    }
};

let generateMacroText = function (currList, generationMode) {
    console.log(currList, generationMode);
    // Get references to macro boxes
    let shoutMacro = document.getElementById("shoutmacro")
    let partyMacro = document.getElementById("partymacro")
    let discordMacro = document.getElementById("discordmacro")
    let macroTemplate = document.getElementById('txtTextTemplate')
    let macroString = checkTextTemplate(macroTemplate.value)

    if (generationMode === "generated") {
        // Show them the total amount of currency generated for the train(s).
        // No worries about max calculation
        let tmpCurrArray = []
        for (let currType in currList) {
            tmpCurrArray.push(currList[currType] + " " + currType)
        }
        let currString = tmpCurrArray.join(", ")
        //macroString = `Tome Check! This train will generate ${currString}.`
        macroString = macroString.replace('$c', currString)
    } else {
        // Show the user the maximum amount of tomes that may be help to prevent overcapping
        // by the end of the train
        let tmpCurrArray = []
        for (let currType in currList) {
            if (currType in currency) {
                let maxHeld = Math.max(currency[currType] - currList[currType], 0);
                tmpCurrArray.push(maxHeld + " " + currType)
            }
        }
        let currString = tmpCurrArray.join(", ")
        // macroString = `Tome Check! Make sure to have less than ${currString} to prevent overcapping!`
        macroString = macroString.replace('$c', currString)
    }

    if (macroString.lastIndexOf(",") > 0) {
        let lastComma = macroString.lastIndexOf(",")
        macroString = macroString.substring(0, lastComma) + " and" + macroString.substring(lastComma + 1)
    }
    shoutMacro.value = `/sh ${macroString}`
    partyMacro.value = `/p ${macroString}`
    discordMacro.value = swapCurrencyWithEmotes(`${macroString}`)
};

let showError = function (errorMsg) {
    let errorDiv = document.getElementById("divErrorMessage");
    errorDiv.innerHTML = errorMsg;
    errorDiv.classList.remove("hidden");
};

let copyMacro = async (macroType, ele) => {
    let text = document.getElementById(macroType).value ?? ''
    try {
        await navigator.clipboard.writeText(text);
        //console.log("Content copied to clipboard");
        ele.innerHTML = 'Copied!'
        setTimeout(function() {
            ele.innerHTML = 'Copy'
        }, 2000)
    } catch (err) {
        //console.error("Failed to copy: ", err);
    }
};

const checkTextTemplate = function(txtString) {
    if(txtString === '' || txtString.length < 1) {
        txtString = 'Tome Check! Make sure to have less than $c to prevent overcapping!';
    }
    if (txtString.lastIndexOf('$c') === -1) {
        txtString += ' $c';
    }
    return txtString;
}

document.addEventListener("DOMContentLoaded", function (ev) {
    let frm = document.getElementById("frmSettings");
    frm.addEventListener("change", function (ev) {
        updateMacros(frm);
    });
    let textTemplate = document.getElementById('txtTextTemplate');
    // Does a user-saved text template exist?
    if(localStorage.getItem('textTemplate') !== null) {
        textTemplate.value = checkTextTemplate(localStorage.getItem('textTemplate'));
    }
    textTemplate.addEventListener("change", function(ev) {
        localStorage.setItem('textTemplate', textTemplate.value);
    })
    let updateButton = document.getElementById("btnUpdate");
    updateButton.addEventListener("click", function (ev) {
        updateMacros(frm);
    });
    document.getElementById('btnCopyShout').addEventListener('click', function() {
        copyMacro('shoutmacro', this)
    })
    document.getElementById('btnCopyParty').addEventListener('click', function() {
        copyMacro('partymacro', this)
    })
    document.getElementById('btnCopyDiscord').addEventListener('click', function() {
        copyMacro('discordmacro', this)
    })
});
//console.log('app.js entry');
