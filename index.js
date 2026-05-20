const root = document.documentElement;

const MAX_NUMBER_POKEMON = 1028;

// [numRows, numCols, maxCharge, radarHints]
const DIFFICULTIES = {
  "easy": [2, 3, 4, 2],
  "medium": [3, 4, 8, 3],
  "hard": [3, 6, 12, 4]
}

const THEMES = {
  forest: {
    background: "url('images/forest.png')",
    primary_colour: "#003c00",
    secondary_colour: "darkseagreen"
  },
  sea: {
    background: "url('images/sea.png')",
    primary_colour: "#0f529b",
    secondary_colour: "skyblue"
  },
  cave: {
    background: "url('images/cave.png')",
    primary_colour: "darkslategrey",
    secondary_colour: "lightslategrey"
  }
}

let difficulty = "easy";
let time = 60;
let timerId = null;
let numClicks = 0;
let numMatches = 0;
let matchesToWin = 3;
let maxCharge = 4;
let gameActive = false;
let firstCard = undefined;
let secondCard = undefined;
let energy = 0;


function applyTheme(newTheme) {
  let theme = THEMES[newTheme];
  root.style.setProperty('--background-image', theme.background);
  root.style.setProperty('--primary-colour', theme.primary_colour);
  root.style.setProperty('--secondary-colour', theme.secondary_colour);
}

function addCharge(amount) {
  energy = Math.min(energy + amount, maxCharge);
  let fill_percent = (energy / maxCharge) * 100;
  console.log(fill_percent)
  $("#progress_fill").css("width", `${fill_percent}%`);

}

function resetCharge() {
  let maxCharge = DIFFICULTIES[difficulty][2];
  energy = 0;
  $("#progress_fill").css("width", "0%");

}

function useRadar() {
  if (energy == DIFFICULTIES[difficulty][2] && firstCard) {
    const radarHints = DIFFICULTIES[difficulty][3];

    // Find all unmatched, unflipped cards (excluding currently flipped firstCard)
    let unflippedCards = $(".card").filter(function () {
      return !$(this).hasClass("flip");
    });
    // If there's a firstCard waiting, find its unflipped match
    if (firstCard) {
      const firstSrc = firstCard.find(".sprite")[0].src;
      const matchingCard = unflippedCards.filter(function () {
        return $(this).find(".sprite")[0].src === firstSrc;
      });

      // Always wiggle the match, then fill remaining hints with random unflipped cards
      let hintsPool = unflippedCards.not(matchingCard);
      let randomHints = shuffle([...hintsPool]).slice(0, radarHints - 1);

      matchingCard.add($(randomHints)).each(function () {
        triggerWiggle($(this));
      });
    }

    resetCharge();
  }
}

function triggerWiggle(card) {
  card.addClass("wiggle");
  card.on("animationend", function () {
    $(this).removeClass("wiggle");
  });
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
      let name = pokemon[index].name[0].toUpperCase() + pokemon[index].name.substring(1);
      console.log(pokemon[index]);
      row +=
        `
        <div id="card${index}" class="card">
          <div class="front_face">
            <img id="img${index}" class="sprite" src="${pokemon[index].sprites.other['official-artwork'].front_default}" alt=""></img>
            <div class="nameplate">
              <div class="pokeball"></div>
              <p class="pokemon_name">${name}</p>
              <div class="pokeball"></div>
            </div>
          </div>
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
  document.getElementById("remaining_pairs").innerHTML = matchesToWin - numMatches;
  
  if(numMatches == matchesToWin) {
    win();
  }
}

function setTime(newTime) {
  time = newTime;
  $("#time").text(time);
}

function startTimer() {
  document.getElementById("time").innerHTML = time--;
  if (time >= 0) {
    timerId = setTimeout(startTimer, 1000);
  }
  else {
    lose();
  }
}

function stopTimer() {
  clearTimeout(timerId);
}

function endGame() {
  gameActive = false;
  stopTimer();
  $("#win_lose_popup").css("display", "flex");

}

function win() {
  $("#win_lose_message").text("You win!")
  endGame();
}

function lose() {
  $(".card").off("click");
  $("#win_lose_message").text("Time's Up!")
  endGame();
}

function clearBoard() {
  $("#game_grid").empty();
  firstCard = undefined;
  secondCard = undefined;
}

async function reset() {
  clearBoard();
  await dealCards();
  stopTimer();
  setTime(60);
  setClicks(0);
  matchesToWin = DIFFICULTIES[difficulty][0] * DIFFICULTIES[difficulty][1] / 2;
  $("#total_pairs").text(DIFFICULTIES[difficulty][0] * DIFFICULTIES[difficulty][1] / 2);
  setMatches(0);
  resetCharge();
}

function handleCardClick() {
  if(firstCard && secondCard) return;
  if(firstCard && $(this).attr("id") == firstCard.attr("id")) return;
  setClicks(++numClicks);
  $(this).toggleClass("flip");
  addCharge(1);

  if (!firstCard)
    firstCard = $(this)
  else {
    secondCard = $(this);
    console.log(firstCard, secondCard);
    if (firstCard.find(".sprite")[0].src == secondCard.find(".sprite")[0].src) {
      console.log("match")
      firstCard.off("click");
      secondCard.off("click");
      addCharge(2);
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

}

async function setup () {
  themeMenuSetup();
  await dealCards();

  $("#start").on(("click"), async function () {
    if (gameActive) return;  // guard goes here instead
    gameActive = true;
    $(".card").on(("click"), handleCardClick);
    startTimer();
  });

  $("#reset").on(("click"), async function () {
    gameActive = false;
    firstCard = undefined;
    secondCard = undefined;
    await reset();
  });


  $("#theme_menu_button").on(("click"), function () {
    $("#theme_menu").css("display", "flex");
  });

  $("#close_theme_menu").on(("click"), function () {
    $("#theme_menu").css("display", "none");
  });

  $("#play_again").on(("click"), function () {
    $("#win_lose_popup").css("display", "none");
    reset();
  });

  $("#radar").on(("click"), useRadar);
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

  $("#difficulty_select").on("change", (event) => {
    difficulty = event.target.value;
    if (!gameActive) {
      reset();
    }
  });

}

$(document).ready(setup);