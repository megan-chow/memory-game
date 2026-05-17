const root = document.documentElement;

const MAX_NUMBER_POKEMON = 1350;

const DIFFICULTIES = {
  "easy": [2, 3],
  "medium": [3, 4],
  "hard": [4, 5]
}

const THEMES = {
  forest: {
    background: "url('images/forest.png')",
    primary_colour: "#003c00",
    secondary_colour: "green"
  },
  sea: {
    background: "url('images/sea.png')",
    primary_colour: "navy",
    secondary_colour: "skyblue"
  },
  cave: {
    background: "url('images/cave.png')",
    primary_colour: "darkslategrey",
    secondary_colour: "lightslategrey"
  }
}

let difficulty = "medium";
let numClicks = 0;
let numMatches = 0;

function applyTheme(newTheme) {
  let theme = THEMES[newTheme];
  root.style.setProperty('--background-image', theme.background);
  root.style.setProperty('--primary-colour', theme.primary_colour);
  root.style.setProperty('--secondary-colour', theme.secondary_colour);
}

async function selectRandomPokemon(numCards) {
  let urls = new Set();
  while(urls.size < numCards / 2) {
    let random = Math.floor(Math.random() * MAX_NUMBER_POKEMON);
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${random}&limit=1`);
    let jsonObj = await response.json();
    
    let pokemon = jsonObj.results[0];
    urls.add(pokemon.url);
  }

  console.log("num pokemon selected: " + urls.size);
  
  let pokemonDetails = [];
  for(const url of urls) {
    let response = await fetch(url);
    let pokemonObj = await response.json();
    pokemonDetails.push(pokemonObj);
    pokemonDetails.push(pokemonObj);
  }

  return shuffle(pokemonDetails);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function dealCards() {
  let numCards = DIFFICULTIES[difficulty][0] * DIFFICULTIES[difficulty][1];
  let pokemon = await selectRandomPokemon(numCards);
  for(let i = 0; i < DIFFICULTIES[difficulty][0]; i++) {
    let row = '<div class="grid_row">';
    for(let j = 0; j < DIFFICULTIES[difficulty][1]; j++) {
      let index = i * DIFFICULTIES[difficulty][1] + j;
      console.log(pokemon[index]);
      row +=
        `
        <div id="card${index}" class="card">
          <img id="img${index}" class="front_face" src="${pokemon[index].sprites.other['official-artwork'].front_default}" alt=""></img>
          <img class="back_face" src="back.webp" alt="">
        </div>
        `;
    }
    row += "</div>";
    $("#game_grid").append(row);
  }
}

function setClicks(newNumClicks) {
  numClicks = newNumClicks;
  document.getElementById("num_clicks").innerHTML = numClicks;
}

function setMatches(newNumMatches) {
  numMatches = newNumMatches;
  document.getElementById("num_matches").innerHTML = numMatches;
  let matchesToWin = DIFFICULTIES[difficulty][0] * DIFFICULTIES[difficulty][1] / 2
  if(numMatches == matchesToWin) {
    win();
  }
}

function win() {

}

async function setup () {
  themeMenuSetup();
  await dealCards();
  let firstCard = undefined
  let secondCard = undefined
  $(".card").on(("click"), function () {
    if(firstCard && secondCard) return;
    if(firstCard && $(this).attr("id") == firstCard.attr("id")) return;
    setClicks(++numClicks);
    $(this).toggleClass("flip");

    if (!firstCard)
      firstCard = $(this)
    else {
      secondCard = $(this);
      console.log(firstCard, secondCard);
      if (firstCard.find(".front_face")[0].src == secondCard.find(".front_face")[0].src) {
        console.log("match")
        firstCard.off("click");
        secondCard.off("click");
        firstCard = undefined;
        secondCard = undefined;
        setMatches(++numMatches);
      } else {
        console.log("no match")
        setTimeout(() => {
          firstCard.toggleClass("flip");
          secondCard.toggleClass("flip");
          firstCard = undefined;
          secondCard = undefined;
        }, 1000)
      }
    }
  });


  $("#theme_menu_button").on(("click"), function () {
    $("#theme_menu").css("display", "flex");
  });

  $("#close_theme_menu").on(("click"), function () {
    $("#theme_menu").css("display", "none");
  });
}

function themeMenuSetup() {
  for (const [name, value] of Object.entries(THEMES)) {
    $("#theme_options").append(
      `
      <div class="theme_option">
        <button name="${name}" style="background-image: ${value.background}"></button>
        <p>${String(name).charAt(0).toUpperCase() + String(name).slice(1)}</p>
      </div>
      `);
  }

  $("#theme_options").on("click", "button", function() {
    const key = $(this).attr("name");
    applyTheme(key);
  });
}

$(document).ready(setup)