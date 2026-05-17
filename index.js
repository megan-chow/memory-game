let MAX_NUMBER_POKEMON = 1350;

async function selectRandomPokemon(numPokemon) {
  let pokemonUrls = new Set();
  while(pokemonUrls.size < numPokemon) {
    let random = Math.floor(Math.random() * MAX_NUMBER_POKEMON);
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${random}&limit=1`);
    let jsonObj = await response.json();
    
    let pokemon = jsonObj.results[0];
    pokemonUrls.add(pokemon.url);
  }
  return pokemonUrls;
}


function setup () {
  let firstCard = undefined
  let secondCard = undefined
  console.log(selectRandomPokemon(3));
  $(".card").on(("click"), function () {
    if(firstCard && secondCard) return;
    $(this).toggleClass("flip");

    if (!firstCard)
      firstCard = $(this).find(".front_face")[0]
    else {
      secondCard = $(this).find(".front_face")[0]
      console.log(firstCard, secondCard);
      if (firstCard.src == secondCard.src) {
        console.log("match")
        $(`#${firstCard.id}`).parent().off("click")
        $(`#${secondCard.id}`).parent().off("click")
        firstCard = undefined;
        secondCard = undefined;
      } else {
        console.log("no match")
        setTimeout(() => {
          // $(`#${firstCard.id}`).parent().toggleClass("flip")
          // $(`#${secondCard.id}`).parent().toggleClass("flip")
          $(`#${firstCard.id}`).parent().toggleClass("flip");
          $(`#${secondCard.id}`).parent().toggleClass("flip");
          firstCard = undefined;
          secondCard = undefined;
        }, 1000)
      }
    }
  });
}

$(document).ready(setup)