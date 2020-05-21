import React from 'react';

// Imports ---------------------------------------------------------------------

import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts';

// Constants -------------------------------------------------------------------

const NO_FILTER = -1;
const MIN_FILTER = 1;
const MAX_FILTER = 2;


// =============================================================================
// <ChartComponent/>
// =============================================================================

class ChartComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      hoveredValue: -1,
      selectedFilter: NO_FILTER
    }
  }

  // the x-axis represents the value in question (# of viewers, # of followers, etc)
  // the y-axis represents the number of streamers that have that value
  extractValueFromChart = (newValue) => {

    if (this.state.hoveredValue !== newValue) {
      this.setState({'hoveredValue': newValue})
    }

    // If the user is dragging a filter, update the value
    if ((this.state.selectedFilter === MIN_FILTER) && (newValue !== this.props.min) && (newValue < this.props.max)) {
      this.props.updateFilter(newValue, this.props.minKey);
    } else if ((this.state.selectedFilter === MAX_FILTER) && (newValue !== this.props.max) && (newValue > this.props.min)) {
      this.props.updateFilter(newValue, this.props.maxKey);
    }
  }

  // takes props.data and breaks it into 3 lists (filtered for being < min, filtered for being > max, and not filtered)
  getFilteredData = (data) => {
    let filtered = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i]['value'] < this.props.min) {
        filtered.push({'value': data[i]['value'], 'min-results': data[i]['results'], 'max-results': 0, 'results': 0 });
      } else if (data[i]['value'] > this.props.max) {
        filtered.push({'value': data[i]['value'], 'min-results': 0, 'max-results': data[i]['results'], 'results': 0 });
      } else {
        filtered.push({'value': data[i]['value'], 'min-results': 0, 'max-results': 0, 'results': data[i]['results'] });
      }
    }
    return filtered;
  }


  // render --------------------------------------------------------------------


  // lineType is either "Min" or "Max"
  renderReferenceLines = (lineType) => {
    let minLabel = "Min: " + this.props.min; // <- label of reference line
    let maxLabel = "Max: " + this.props.max;
    let minColor = "red";                    // <- the color of the reference line
    let maxColor = "red";
    let minWidth = 2;                        // <- the width of the reference line
    let maxWidth = 2;
    if (this.state.hoveredValue !== -1) {
      let distanceToMin = Math.abs(this.props.min - this.state.hoveredValue);
      let distanceToMax = Math.abs(this.props.max - this.state.hoveredValue);
      if (distanceToMax > distanceToMin) {
        minWidth = 6;
      } else {
        maxWidth = 6;
      }
    }

    // a custom Component for rendering the label
    function ReferenceLabel(props) {
      const { fill, value, viewBox } = props;
      const x = viewBox.width + viewBox.x + props.xOffset;
      const y = viewBox.y - 6;
      return (
          <text x={x} y={y} fill={fill} fontSize={17}>
              {value}
          </text>
      )
    }

    return {
      'min': <ReferenceLine x={this.props.min} label={<ReferenceLabel value={minLabel} fill='red' xOffset={-60}/>} stroke={minColor} strokeWidth={minWidth} alwaysShow style={{'cursor': 'ew-resize'}} onMouseDown={() => this.setState({'selectedFilter': MIN_FILTER})} />,
      'max': <ReferenceLine x={this.props.max} label={<ReferenceLabel value={maxLabel} fill='red' xOffset={5}/>} stroke={maxColor} strokeWidth={maxWidth} alwaysShow style={{'cursor': 'ew-resize'}} onMouseDown={() => this.setState({'selectedFilter': MAX_FILTER})} />
    }
  }

  // we don't want to actually render the tooltip, we just want to intercept the "value" of the x-axis label we are currently on
  renderToolTip = () => {
    const CustomTooltip = ({ active, payload, label }) => {
      if (active) { this.extractValueFromChart(label); }
      return null;
    };

    return (
      <Tooltip content={<CustomTooltip/>}/>
    );
  }


  render() {
    let data = this.getFilteredData(this.props.data);
    let referenceLines = this.renderReferenceLines();

    return (
      <div style={{'height': '100%', 'width': '100%'}}>
        <p>Value: {this.state.hoveredValue}; Filter: {this.state.selectedFilter}</p>
        <ResponsiveContainer width="80%" height="80%">

          <AreaChart
             data={data}
             margin={{top: 20, right: 50, left: 20, bottom: 5,}}
             onMouseLeave={() => this.setState({hoveredValue: -1, selectedFilter: NO_FILTER})}
             onMouseUp={() => this.setState({selectedFilter: NO_FILTER})}
           >

             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="value" />
             <YAxis />
             {this.renderToolTip()}

             <Area type="monotone" dataKey="results" stroke="#56c990" fill="#56c990" isAnimationActive={false}/>
             <Area type="monotone" dataKey="min-results" stroke="grey" fill="grey" isAnimationActive={false}/>
             <Area type="monotone" dataKey="max-results" stroke="grey" fill="grey" isAnimationActive={false}/>

             {/* Make sure to render reference lines last so they get rendered above everything else*/}
             {referenceLines['min']}
             {referenceLines['max']}
         </AreaChart>
       </ResponsiveContainer>
      </div>
    )
  }
}


export default ChartComponent;
