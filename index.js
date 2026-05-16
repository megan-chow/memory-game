let MAX_NUMBER_POKEMON = 1350;

function selectRandomPokemon(numPokemon) {
  let pokemonIds = Set();
  while(pokemonIds.size < numPokemon) {
    let random = Math.floor(Math.random() * MAX_NUMBER_POKEMON);
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=1`);
    let jsonObj = await response.json();
  }
}


function setup () {
  let firstCard = undefined
  let secondCard = undefined
  $(".card").on(("click"), function () {
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
      } else {
        console.log("no match")
        let prevFirstCard = $(`#${firstCard.id}`).parent();
        let prevSecondCard = $(`#${secondCard.id}`).parent();
        setTimeout(() => {
          // $(`#${firstCard.id}`).parent().toggleClass("flip")
          // $(`#${secondCard.id}`).parent().toggleClass("flip")
          prevFirstCard.toggleClass("flip");
          prevSecondCard.toggleClass("flip");
        }, 1000)
      }
      firstCard = undefined;
      secondCard = undefined;
    }
  });
}

$(document).ready(setup)