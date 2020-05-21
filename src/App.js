import React from 'react';
import logo from './logo.svg';
import './App.css';

import AreaChartFilterInput from './AreaChartFilterInput';

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
      'min': 25,
      'max': 190
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
        <div style={{'width': '70%', 'height': '700px', 'border': '1px solid grey', 'marginBottom': '30px', 'flexShrink': '0', 'flexGrow': '0'}}>
          <AreaChartFilterInput
            data={data} min={this.state.min}
            max={this.state.max}
            updateFilter={this.updateFilterValue}
            minKey='min'
            maxKey='max'
            yAxisLabel="# of Results"
            xAxisLabel="Value to Filter By"
          />
        </div>


        <h1>Edit Mode Off and Custom Colors</h1>
        <div style={{'width': '70%', 'height': '700px', 'border': '1px solid grey', 'marginBottom': '30px', 'flexShrink': '0', 'flexGrow': '0'}}>
          <AreaChartFilterInput
            data={data}
            min={this.state.min}
            max={this.state.max}
            updateFilter={this.updateFilterValue}
            minKey='min'
            maxKey='max'
            yAxisLabel="# of Results"
            xAxisLabel="Value to Filter By"
            editModeOff
            colorFilter='blue'
            colorValid='blue'
            colorInvalid='darkblue'
            colorLabel='white'
          />
        </div>

        <h1>Simple Mode On</h1>
        <div style={{'width': '70%', 'height': '700px', 'border': '1px solid grey', 'marginBottom': '30px', 'flexShrink': '0', 'flexGrow': '0'}}>
          <AreaChartFilterInput
            data={data}
            min={this.state.min}
            max={this.state.max}
            updateFilter={this.updateFilterValue}
            minKey='min'
            maxKey='max'
            yAxisLabel="# of Results"
            xAxisLabel="Value to Filter By"
            simpleModeOn
            colorValid='red'
            colorInvalid='black'
          />
        </div>
      </div>
    );
  }

}

export default App;
