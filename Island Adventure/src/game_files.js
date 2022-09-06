(function(){
//Get a reference to the stage and output
var stage = document.querySelector("#stage");
var output = document.querySelector("#output");

//Add a keyboard listener
window.addEventListener("keydown", keydownHandler, false);

//The game map
var map =
[
  [2, 4, 1, 0, 4, 3, 4, 0, 4, 2],
  [0, 0, 0, 0, 2, 8, 4, 0, 0, 0],
  [0, 0, 0, 0, 4, 2, 4, 0, 1, 0],
  [0, 4, 0, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 4, 2 ,0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 0, 4],
  [0, 0, 4, 4, 0, 0, 0, 4, 1, 4],
  [4, 0, 0, 1, 0, 4, 4, 4, 4, 4]
];

//The game objects map
var gameObjects =
[
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 7, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 0, 0, 0, 0, 0, 0, 0, 0]
];

//Map code
var WATER = 0;
var ISLAND = 1;
var PIRATE = 2;
var HOME = 3;
var ROCK = 4;
var SHIP = 5;
var MONSTERONE = 6;
var MONSTERTWO = 7;
var CHEST = 8;

//The size of each cell
var SIZE = 64;

//The number of rows and columns
var ROWS = map.length;
var COLUMNS = map[0].length;

//Find the ship's and monster's start positions
var shipRow;
var shipColumn;
var monsterOneRow;
var monsterOneColumn;
var monsterTwoRow;
var monsterTwoColumn;

for(var row = 0; row < ROWS; row++) 
{	
  for(var column = 0; column < COLUMNS; column++) 
  {
    if(gameObjects[row][column] === SHIP)
    { 
      shipRow = row;
      shipColumn = column;
    }
    if(gameObjects[row][column] === MONSTERONE)
    { 
      monsterOneRow = row;
      monsterOneColumn = column;
    }
    if(gameObjects[row][column] === MONSTERTWO)
    { 
      monsterTwoRow = row;
      monsterTwoColumn = column;
    }
  }
}

//Arrow key codes
var UP = 38;
var DOWN = 40;
var RIGHT = 39;
var LEFT = 37;

//The game variables
var food = 25;
var gold = 30;
var experience = 0;
var gameMessage = "Your home is blockaded by pirates!!! Use the arrow keys to fight your way home. Dont run into the rocks!!!";

render();

function keydownHandler(event)
{ 
  switch(event.keyCode)
  {
    case UP:
	    if(shipRow > 0)
	    {
	      //Clear the ship's current cell
	      gameObjects[shipRow][shipColumn] = 0;
	      
	      //Subract 1 from the ship's row
	      shipRow--;
	      
	      //Apply the ship's new updated position to the array
	      gameObjects[shipRow][shipColumn] = SHIP;
	    }
	    break;
	  
	  case DOWN:
	    if(shipRow < ROWS - 1)
	    {
	      gameObjects[shipRow][shipColumn] = 0;
	      shipRow++;
	      gameObjects[shipRow][shipColumn] = SHIP;
	    }
	    break;
	    
	  case LEFT:
	    if(shipColumn > 0)
	    {
	      gameObjects[shipRow][shipColumn] = 0;
	      shipColumn--;
	      gameObjects[shipRow][shipColumn] = SHIP;
	    }
	    break;  
	    
	  case RIGHT:
	    if(shipColumn < COLUMNS - 1)
	    {
	      gameObjects[shipRow][shipColumn] = 0;
	      shipColumn++;
	      gameObjects[shipRow][shipColumn] = SHIP;
	    }
	    break; 
  }
  
  //find out what kind of cell the ship is on
  switch(map[shipRow][shipColumn])
  {
    case WATER:
      gameMessage = "You sail the open seas."
      break;
    
    case PIRATE:
      fight();
      break; 
    
    case ISLAND:
      trade();
      break; 
      
    case HOME:
      endGame();
      break; 
      
    case ROCK:
      endGame();
      break;  
    
    case CHEST:
         gold += 20;
         
         gameMessage = "You found a chest with 20 gold in it";
         
         for(var row = 0; row < ROWS; row++) 
         {	
            for(var column = 0; column < COLUMNS; column++) 
            { 
               if(map[row][column] === CHEST)
               {
                  map[row][column] = WATER;
               }
            }
         }
      break;   
  }
  
  //Move the monsterOne and monsterTwo
  moveMonsterOne();
  moveMonsterTwo();
  
  
  //Find out if the ship is touching the monster
  if(gameObjects[shipRow][shipColumn] === MONSTERONE || gameObjects[shipRow][shipColumn] === MONSTERTWO)
  {
    endGame();
  }
 
  //Subtract some food each turn
  food--;
  
  //Find out if the ship has run out of food or gold
  if(food <= 0 || gold <= 0)
  {
    endGame();
  }
  
  //Render the game
  render();
}

function moveMonsterOne()
{
  //The 4 possible directions that the monster can move
  var UP = 1;
  var DOWN = 2;
  var LEFT = 3;
  var RIGHT = 4;
  
  //An array to store the valid direction that
  //the monster is allowed to move in
  var validDirections = [];
  
  //The final direction that the monster will move in
  var direction = undefined;
  
  //Find out what kinds of things are in the cells 
  //that surround the monster. If the cells contain water,
  //push the corresponding direction into the validDirections array
  if(monsterOneRow > 0)
  {
    var thingAbove = map[monsterOneRow - 1][monsterOneColumn];
    var objectAbove = gameObjects[monsterOneRow - 1][monsterOneColumn];
    if(thingAbove === WATER && objectAbove === WATER)
	  {
	    validDirections.push(UP);
	  }
  }
  if(monsterOneRow < ROWS - 1)
  { 
    var thingBelow = map[monsterOneRow + 1][monsterOneColumn];
    var objectBelow = gameObjects[monsterOneRow + 1][monsterOneColumn];
    if(thingBelow === WATER && objectBelow === WATER)
	  {
	    validDirections.push(DOWN);
	  }
  }
  if(monsterOneColumn > 0)
  {
    var thingToTheLeft = map[monsterOneRow][monsterOneColumn - 1];
    var objectToTheLeft = gameObjects[monsterOneRow][monsterOneColumn - 1];
    if(thingToTheLeft === WATER && objectToTheLeft === WATER)
	  {
	    validDirections.push(LEFT);
	  }
  } 
  if(monsterOneColumn < COLUMNS - 1)
  {
    var thingToTheRight = map[monsterOneRow][monsterOneColumn + 1];
    var objectToTheRight = gameObjects[monsterOneRow][monsterOneColumn + 1];
    if(thingToTheRight === WATER && objectToTheRight === WATER)
	  {
	    validDirections.push(RIGHT);
	  }
  } 
  
  //The validDirections array now contains 0 to 4 directions that the 
  //contain WATER cells. Which of those directions will the monster
  //choose to move in?
  
  //If a valid direction was found, Randomly choose one of the 
  //possible directions and assign it to the direction variable
  if(validDirections.length !== 0)
  {
    var randomNumber = Math.floor(Math.random() * validDirections.length);
    direction = validDirections[randomNumber];
  }
  
  //Move the monster in the chosen direction
  switch(direction)
  {
    case UP:
      //Clear the monster's current cell
		  gameObjects[monsterOneRow][monsterOneColumn] = 0;
		  //Subtract 1 from the monster's row
		  monsterOneRow--; 
		  //Apply the monster's new updated position to the array
		  gameObjects[monsterOneRow][monsterOneColumn] = MONSTERONE;
		  break;
	  
	  case DOWN:
	    gameObjects[monsterOneRow][monsterOneColumn] = 0;
		  monsterOneRow++;
		  gameObjects[monsterOneRow][monsterOneColumn] = MONSTERONE;
	    break;
	  
	  case LEFT:
	    gameObjects[monsterOneRow][monsterOneColumn] = 0;
		  monsterOneColumn--;
		  gameObjects[monsterOneRow][monsterOneColumn] = MONSTERONE;
	    break;
	 
	 case RIGHT:
	    gameObjects[monsterOneRow][monsterOneColumn] = 0;
		  monsterOneColumn++;
		  gameObjects[monsterOneRow][monsterOneColumn] = MONSTERONE;
  }
}

function moveMonsterTwo()
{
  //The 4 possible directions that the monster can move
  var UP = 1;
  var DOWN = 2;
  var LEFT = 3;
  var RIGHT = 4;
  
  //An array to store the valid direction that
  //the monster is allowed to move in
  var validDirections = [];
  
  //The final direction that the monster will move in
  var direction = undefined;
  
  //Find out what kinds of things are in the cells 
  //that surround the monster. If the cells contain water,
  //push the corresponding direction into the validDirections array
  if(monsterTwoRow > 0)
  {
    var thingAbove = map[monsterTwoRow - 1][monsterTwoColumn];
    var objectAbove = gameObjects[monsterTwoRow - 1][monsterTwoColumn];
    if(thingAbove === WATER && objectAbove === WATER)
	  {
	    validDirections.push(UP);
	  }
  }
  if(monsterTwoRow < ROWS - 1)
  { 
    var thingBelow = map[monsterTwoRow + 1][monsterTwoColumn];
    var objectBelow = gameObjects[monsterTwoRow + 1][monsterTwoColumn];
    if(thingBelow === WATER && objectBelow === WATER)
	  {
	    validDirections.push(DOWN);
	  }
  }
  if(monsterTwoColumn > 0)
  {
    var thingToTheLeft = map[monsterTwoRow][monsterTwoColumn - 1];
    var objectToTheLeft = gameObjects[monsterTwoRow][monsterTwoColumn - 1];
    if(thingToTheLeft === WATER && objectToTheLeft === WATER)
	  {
	    validDirections.push(LEFT);
	  }
  } 
  if(monsterTwoColumn < COLUMNS - 1)
  {
    var thingToTheRight = map[monsterTwoRow][monsterTwoColumn + 1];
    var objectToTheRight = gameObjects[monsterTwoRow][monsterTwoColumn + 1];
    if(thingToTheRight === WATER && objectToTheRight === WATER)
	  {
	    validDirections.push(RIGHT);
	  }
  } 
  
  //The validDirections array now contains 0 to 4 directions that the 
  //contain WATER cells. Which of those directions will the monster
  //choose to move in?
  
  //If a valid direction was found, Randomly choose one of the 
  //possible directions and assign it to the direction variable
  if(validDirections.length !== 0)
  {
    var randomNumber = Math.floor(Math.random() * validDirections.length);
    direction = validDirections[randomNumber];
  }
  
  //Move the monster in the chosen direction
  switch(direction)
  {
    case UP:
      //Clear the monster's current cell
		  gameObjects[monsterTwoRow][monsterTwoColumn] = 0;
		  //Subtract 1 from the monster's row
		  monsterTwoRow--; 
		  //Apply the monster's new updated position to the array
		  gameObjects[monsterTwoRow][monsterTwoColumn] = MONSTERTWO;
		  break;
	  
	  case DOWN:
	    gameObjects[monsterTwoRow][monsterTwoColumn] = 0;
		  monsterTwoRow++;
		  gameObjects[monsterTwoRow][monsterTwoColumn] = MONSTERTWO;
	    break;
	  
	  case LEFT:
	    gameObjects[monsterTwoRow][monsterTwoColumn] = 0;
		  monsterTwoColumn--;
		  gameObjects[monsterTwoRow][monsterTwoColumn] = MONSTERTWO;
	    break;
	 
	 case RIGHT:
	    gameObjects[monsterTwoRow][monsterTwoColumn] = 0;
		  monsterTwoColumn++;
		  gameObjects[monsterTwoRow][monsterTwoColumn] = MONSTERTWO;
  }
}

function trade()
{
  //Figure out how much food the island has
  //and how much it should cost
  var islandsFood = experience + gold;
  var cost = Math.ceil(Math.random() * islandsFood);
  
  //Let the player buy food if there's enough gold
  //to afford it
  if(gold > cost)
  {
    food += islandsFood;
    gold -= cost;
    experience += 2;
    
    gameMessage 
      = "You buy " + islandsFood + " coconuts"
      + " for " + cost + " gold pieces."
  }
  else
  {
    //Tell the player if they don't have enough gold
    experience += 1;
    gameMessage = "You don't have enough gold to buy food."
  }
}

function fight()
{
  
  //The ships strength
  var shipStrength = Math.ceil((food + gold) / 2);
  
  //A random number between 1 and the ship's strength
  var pirateStrength = Math.ceil(Math.random() * shipStrength * 2);
  
  if(pirateStrength > shipStrength)
  {
    //The pirates ransack the ship
    var stolenGold = Math.round(pirateStrength / 2);
    gold -= stolenGold;
    
    //Give the player some experience for trying  
    experience += 1;
    
    //Update the game message
    gameMessage 
      = "You fight and LOSE " + stolenGold + " gold pieces."
      + " Ship's strength: " + shipStrength 
      + " Pirate's strength: " + pirateStrength;
  }
  else
  {
    //You win the pirates' gold
    var pirateGold = Math.round(pirateStrength / 2);
    gold += pirateGold;
    
    //Add some experience  
    experience += 2;
    
    //Update the game message
    gameMessage 
      = "You fight and WIN " + pirateGold + " gold pieces."
      + " Ship's strength: " + shipStrength 
      + " Pirate's strength: " + pirateStrength;
  } 
}

function endGame()
{
  if(map[shipRow][shipColumn] === HOME)
  {
    //Calculate the score
    var score = food + gold + experience;
    
    //Display the game message
    gameMessage 
      = "You made it home ALIVE! " + "Final Score: " + score; 
  }
  else if(gameObjects[shipRow][shipColumn] === MONSTERONE)
  {
    gameMessage 
      = "Your ship has been swallowed by a sea monster!";
  }
  else if(gameObjects[shipRow][shipColumn] === MONSTERTWO)
  {
    gameMessage 
      = "Your ship has been swallowed by a sea monster!";
  }
  else if(map[shipRow][shipColumn] === ROCK)
  {
    gameMessage
      = "Your ship has run into a rock and broke up";
  }

  else
  {
    //Display the game message
    if(gold <= 0)
    {
      gameMessage += " You've run out of gold!"; 
    }
    else
    {
      gameMessage += " You've run out of food!"; 
    }
    
    gameMessage 
      += " Your crew throws you overboard!"; 
  }
  
  //Remove the keyboard listener to end the game
  window.removeEventListener("keydown", keydownHandler, false);
}

function render()
{
  //Clear the stage of img cells
  //from the previous turn
  
  if(stage.hasChildNodes())
  {
    for(var i = 0; i < ROWS * COLUMNS; i++) 
    {	 
      stage.removeChild(stage.firstChild);
    }
  }
  
  //Render the game by looping through the map arrays
  for(var row = 0; row < ROWS; row++) 
  {	
    for(var column = 0; column < COLUMNS; column++) 
    { 
      //Create a img tag called cell
      var cell = document.createElement("img");

      //Set it's CSS class to "cell"
      cell.setAttribute("class", "cell");

      //Add the img tag to the <div id="stage"> tag
      stage.appendChild(cell);

      //Find the correct image for this map cell
      switch(map[row][column])
      {
        case WATER:
          cell.src = "../images/water.png";
          break;

        case ISLAND:
          cell.src = "../images/island.png";
          break; 

        case PIRATE:
          cell.src = "../images/pirate.png";
          break; 

        case HOME:
          cell.src = "../images/home.png";
          break;   
          
        case ROCK:
          cell.src = "../images/rock.png";
          break;
          
        case CHEST:
          cell.src = "../images/chest.png";
          break;
      }  
      
      //Add the ship and monster from the gameObjects array
	    switch(gameObjects[row][column])
	    {
         
	      case SHIP:
	        cell.src = "../images/ship.png";
	        break;   
	        
	      case MONSTERONE:
	        cell.src = "../images/monster.png";
            console.log("one " + monsterOneRow + "," + monsterOneColumn);
	        break;  
           
         case MONSTERTWO:
	        cell.src = "../images/monster.png";
            console.log("two " + monsterTwoRow + "," + monsterTwoColumn);
	        break;  
	    } 
       
      //Position the cell 
      cell.style.top = row * SIZE + "px";
      cell.style.left = column * SIZE + "px";
    }
  }
 
   //Display the game message
	output.innerHTML = gameMessage;
	
	//Display the player's food, gold, and experience
	output.innerHTML 
	  += "<br>Gold: " + gold + ", Food: " 
	  + food + ", Experience: " + experience;
}
}());