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
for (let i = 0; i < 100; i++) {
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
    );
  }

}

export default App;
