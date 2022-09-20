import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

//FontAwesome icons 

import { FaPlay, FaPause, FaRandom, FaTrash, FaStopwatch, FaSeedling } from "react-icons/fa";

//Creates Cell component

class Cell extends React.Component {

  // Defines an individual selectCell function for this component
  selectCell = () => {
    this.props.selectCell(this.props.row, this.props.col);
  }

  // renders the cell component
  render(){
    return(
      <div
        className={this.props.CellClass}
        id={this.props.id}
        onClick={this.selectCell}
      />
    );
  }
}

// Creates Grid Component

class Grid extends React.Component {
  render(){
    //Multiplies the amount of columns in grid by the width of the cells
    const width = (this.props.cols * 18) + 1;
    var rowsArr = [];
    // Nested for loop to generate rows and columns in Cell class, could use map but this runs quicker?
    var CellClass = "";
    for (var x = 0; x < this.props.rows; x++) {
      for (var y = 0; y < this.props.cols; y++){
        let CellId = x + "_" + y;
        // Ternerary statement to check if the Cell is dead or alive
        CellClass = this.props.gridFull[x][y] ? "cell alive" : "cell dead";
        rowsArr.push(
          <Cell
            CellClass={CellClass}
            key={CellId}
            CellId={CellId}
            row={x}
            col={y}
            selectCell={this.props.selectCell}
          />
        );
      }
      
    }

    return (
      <div className='grid' style={{width: width}}>
        {rowsArr}
      </div>
    );
  }
}

// Creates the Buttons component

class Buttons extends React.Component{
  
  render() {
    return(
      <div className="buttons-container">
        <button className="btn-primary" onClick={this.props.playButton}>Play<FaPlay/></button>
        <button className="btn-primary" onClick={this.props.pauseButton}>Pause<FaPause/></button>
        <button className="btn-primary" onClick={this.props.clear}>Clear<FaTrash/></button>
        <button className="btn-primary" onClick={this.props.slow}>Slow<FaStopwatch/></button>
        <button className="btn-primary" onClick={this.props.fast}>Fast<FaStopwatch/></button>
        <button className="btn-primary" onClick={this.props.seedCells}>Seed<FaRandom/></button>
      </div>
    );
  }
}

class Main extends React.Component{

  constructor(){
    super();
    //Defines how fast the programme will run
    this.speed = 100;
    //Defines amount of columns and rows in the grid
    this.rows = 30;
    this.cols = 50;

    this.state = {
      generation: 0,
      // Creates an array based on the above defined column and row amounts 
      gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
    }
  }

  // Methods

  // Updates array with cells that have been selected and set their state to true or 'alive'

  selectCell = (row, col) => {
      let gridCopy = arrayClone(this.state.gridFull);
      gridCopy[row][col] = !gridCopy[row][col];
      this.setState({
          gridFull: gridCopy
      });
    }

    // Randomly generates starting config of alive cells in the grid 

    seedCells = () =>{
      let gridCopy = arrayClone(this.state.gridFull);
      for(let x = 0; x < this.rows; x++){
        for(let y = 0; y < this.cols; y++) {
          //Is multiplied by 4 to give a 25 percent chance of a cell being randomly assigned an alive state, could lower number for lower amount of cells?
          if (Math.floor(Math.random() * 4) === 1){
            gridCopy[x][y] = true;
          }
        }
      }
      this.setState({
        gridFull: gridCopy
      });
    }

// Button methods 

// Method for the button that plays the game

playButton = () =>{
  //Clears current game if the button is pressed again
  clearInterval(this.intervalId)
  //Sets up the new game 
  this.intervalId = setInterval(this.play, this.speed);
}

// Method for the button that pauses the game

pauseButton = () => {
  clearInterval(this.intervalId);
}

// Methods for different game speeds 

slow = () => {
    this.speed = 1000;
    //Restarts the game at the new speed
    this.playButton();
}

// Fast will reset the game to it's default speed 

fast = () => {
  this.speed = 100;
  //Restarts the game at the new speed
  this.playButton();
}

// Clears the grid 

clear = () => {
  var grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
  this.setState({
    gridFull: grid,
    generation: 0
  });
}

// Function for actually playing the game

play = () => {
  // Uses the current grid state
  let g = this.state.gridFull;
  // Change the squares in this grid clone and then set the current state to the altered configuration
  let g2 = arrayClone(this.state.gridFull);
  // Functionality to check the surrounding cells arround the current one, decides if cell should be alive or dead
  for (let x = 0; x < this.rows; x++){
    for (let y = 0; y < this.cols; y++){
      let count = 0;
      // Checks amount of alive neighbouring cells and sets the state to dead or alive based on this, couldn't think of another way to check than with x and y positioning and ensuring current cell is not counted
      // One line per potential neigbour
      if (x > 0) if (g[x - 1][y]) count++;
      if (x > 0 && y > 0) if (g[x - 1][y - 1]) count++;
      if (x > 0 && y < this.cols - 1) if (g[x - 1][y + 1]) count++;
      if (y < this.cols - 1) if (g[x][y + 1]) count++;
      if (y > 0) if (g[x][y - 1]) count++;
      if (x < this.rows - 1) if (g[x + 1][y]) count++;
      if (x < this.rows - 1 && y > 0) if (g[x + 1][y - 1]) count++;
      if (x < this.rows - 1 && y < this.cols - 1) if (g[x + 1][y + 1]) count++;
      // Applies the rules of the game of life based on the count returned by the above checks 
      if (g[x][y] && (count < 2 || count > 3)) g2[x][y] = false;
      if (!g[x][y] && count === 3) g2[x][y] = true;
    }
  }

  this.setState({
    gridFull: g2,
    // Adds to the generation counter once the next grid generation has been applied
    generation: this.state.generation + 1
  });

}


// Run methods when the application loads 

componentDidMount(){
  this.seedCells();
}

  render(){
    return (
      <div className="content-center">
        <h1><FaSeedling/> The Game of Life <FaSeedling/></h1>
        <p>John Conway’s game of life built using React JS</p>
        {/*Generates the grid */}
        <Grid 
        gridFull={this.state.gridFull}
        rows={this.rows} 
        cols={this.cols}
        selectCell={this.selectCell}
        />
        <Buttons className="buttons-container"
          playButton={this.playButton}
          pauseButton={this.pauseButton}
          clear={this.clear}
          slow={this.slow}
          fast={this.fast}
          seedCells={this.seedCells}
          gridSize={this.gridSize}
        />
        <p>Generations: {this.state.generation}</p>
      </div>
    )
  }
}

// Helper function to clone the array of cells in the grid, used when making updates to cells

function arrayClone(arr) {
  return JSON.parse(JSON.stringify(arr));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
reportWebVitals();
