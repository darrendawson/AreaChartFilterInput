import React from 'react';
import logo from './logo.svg';
import './App.css';

import ChartComponent from './ChartComponent';

// Constants and Input Data ----------------------------------------------------

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let data = [];
let prevAmount = 1000;
for (let i = 0; i < 500; i++) {
  if (i % 7 == 0) {
    continue;
  }
  let newAmount = prevAmount + getRandomInt(-100, 100);
  if (newAmount < 0) {
    newAmount = 0;
  }
  data.push({
    'value': i,
    'results': newAmount
  });
  prevAmount = newAmount;
}

// =============================================================================
// <App/>
// =============================================================================

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      'min': 4,
      'max': 90
    }
  }

  updateFilterValue = (value, filterType) => {
    if ((filterType === 'min') && (this.state.min !== value)) {
      this.setState({'min': value});
    } else if ((filterType == 'max') && (this.state.max !== value)) {
      this.setState({'max': value});
    }
  }


  render() {
    return (
      <div className="App">
        <h1>Edit Mode</h1>
        <div style={{'width': '70%', 'height': '700px', 'border': '1px solid grey', 'margin-bottom': '30px', 'flex-shrink': '0', 'flex-grow': '0'}}>
          <ChartComponent
            data={data} min={this.state.min}
            max={this.state.max}
            updateFilter={this.updateFilterValue}
            minKey='min'
            maxKey='max'
            yAxisLabel="# of Results"
            xAxisLabel="Value to Filter By"
          />
        </div>

        <h1>Edit Mode Off</h1>
        <div style={{'width': '70%', 'height': '700px', 'border': '1px solid grey', 'margin-bottom': '30px', 'flex-shrink': '0', 'flex-grow': '0'}}>
          <ChartComponent
            data={data} min={this.state.min}
            max={this.state.max}
            updateFilter={this.updateFilterValue}
            minKey='min'
            maxKey='max'
            yAxisLabel="# of Results"
            xAxisLabel="Value to Filter By"
            editModeOff
          />
        </div>

        <h1>Simple Mode On</h1>
        <div style={{'width': '70%', 'height': '700px', 'border': '1px solid grey', 'margin-bottom': '30px', 'flex-shrink': '0', 'flex-grow': '0'}}>
          <ChartComponent
            data={data} min={this.state.min}
            max={this.state.max}
            updateFilter={this.updateFilterValue}
            minKey='min'
            maxKey='max'
            yAxisLabel="# of Results"
            xAxisLabel="Value to Filter By"
            simpleModeOn
          />
        </div>
      </div>
    );
  }

}

export default App;
