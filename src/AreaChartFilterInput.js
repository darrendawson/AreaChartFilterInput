// =============================================================================
// About AreaChartFilterInput.js
// =============================================================================
/*
  AreaChartFilterInput contains the <AreaChartFilterInput/> component.

  Props:
      - data={data}
      - min={this.state.min}
      - max={this.state.max}
      - updateFilter={this.updateFilterValue}
      - minKey='min'
      - maxKey='max'
      - yAxisLabel="# of Results"
      - xAxisLabel="Value to Filter By"
      - editModeOff
      - colorFilter='blue'
      - colorValid='blue'
      - colorInvalid='darkblue'
      - colorLabel='white'
*/


// Imports ---------------------------------------------------------------------
import React from 'react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';

// Constants -------------------------------------------------------------------

const NO_FILTER = -1;
const MIN_FILTER = 1;
const MAX_FILTER = 2;


// =============================================================================
// <AreaChartFilterInput/>
// =============================================================================

class AreaChartFilterInput extends React.Component {
  constructor() {
    super();
    this.state = {
      hoveredValue: -1,
      selectedFilter: NO_FILTER
    }
  }


  // function gets called when a user clicks on a filter reference line and starts to drag it
  // -> this will set the selectedFilter (if in edit mode)
  selectFilter = (filter) => {
    if (this.props.editModeOff) { return; }
    if (this.state.selectedFilter !== filter) {
      this.setState({selectedFilter: filter});
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
    let stats = {min: false, max: false}; // <- keeps track of what the min/max values in the entire dataset are
    let distribution = {
      'min':   {'n': 0, 'total': 0},
      'valid': {'n': 0, 'total': 0},
      'max':   {'n': 0, 'total': 0}
    }

    for (let i = 0; i < data.length; i++) {
      if (data[i]['value'] < this.props.min) {
        filtered.push({'value': data[i]['value'], 'min-results': data[i]['results'], 'max-results': 0, 'results': 0 });
        distribution['min']['n'] += 1;
        distribution['min']['total'] += data[i]['results'];
      } else if (data[i]['value'] > this.props.max) {
        filtered.push({'value': data[i]['value'], 'min-results': 0, 'max-results': data[i]['results'], 'results': 0 });
        distribution['max']['n'] += 1;
        distribution['max']['total'] += data[i]['results'];
      } else {
        filtered.push({'value': data[i]['value'], 'min-results': 0, 'max-results': 0, 'results': data[i]['results'] });
        distribution['valid']['n'] += 1;
        distribution['valid']['total'] += data[i]['results'];
      }

      if ((stats['min'] === false) || (data[i]['value'] < stats['min'])) {
        stats['min'] = data[i]['value'];
      } else if ((stats['max'] === false) || (data[i]['value'] > stats['max'])) {
        stats['max'] = data[i]['value'];
      }
    }
    return [filtered, stats, distribution];
  }


  getColor = (colorName) => {
    if (colorName === 'valid') {
      return (this.props.colorValid !== undefined) ? this.props.colorValid : "#56c990";
    } else if (colorName === 'invalid') {
      return (this.props.colorInvalid !== undefined) ? this.props.colorInvalid : "grey";
    } else if (colorName === 'filter') {
      return (this.props.colorFilter !== undefined) ? this.props.colorFilter : "red";
    } else if (colorName === 'label') {
      return (this.props.colorLabel !== undefined) ? this.props.colorLabel : "black";
    }
  }


  // render --------------------------------------------------------------------


  // lineType is either "Min" or "Max"
  renderReferenceLines = (lineType) => {
    let minLabel = "Min: " + this.props.min; // <- label of reference line
    let maxLabel = "Max: " + this.props.max;
    let minColor = this.getColor('filter');                    // <- the color of the reference line
    let maxColor = this.getColor('filter');
    let minWidth = 2;                        // <- the width of the reference line
    let maxWidth = 2;
    if (this.state.hoveredValue !== -1) {
      let distanceToMin = Math.abs(this.props.min - this.state.hoveredValue);
      let distanceToMax = Math.abs(this.props.max - this.state.hoveredValue);
      if (distanceToMax > distanceToMin) {
        if (! this.props.editModeOff) {
          minWidth = 6;
        }
      } else {
        if (! this.props.editModeOff) {
          maxWidth = 6;
        }
      }
    }

    // a custom Component for rendering the label
    function ReferenceLabel(props) {
      const { fill, value, viewBox } = props;
      const x = viewBox.width + viewBox.x + props.xOffset;
      const y = viewBox.y - 6;
      return (
          <text x={x} y={y} fill={fill} fontSize={22}>
              {value}
          </text>
      )
    }

    let styling = {'cursor': 'ew-resize'};
    if (this.props.editModeOff) {
      styling['cursor'] = 'default';
    }
    return {
      'min': <ReferenceLine x={this.props.min} label={<ReferenceLabel value={minLabel} fill={this.getColor('filter')} xOffset={-90}/>} stroke={minColor} strokeWidth={minWidth} ifOverflow="extendDomain" style={styling} onMouseDown={() => this.selectFilter(MIN_FILTER)} />,
    'max': <ReferenceLine x={this.props.max} label={<ReferenceLabel value={maxLabel} fill={this.getColor('filter')} xOffset={5}/>} stroke={maxColor} strokeWidth={maxWidth} ifOverflow="extendDomain" style={styling} onMouseDown={() => this.selectFilter(MAX_FILTER)} />
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


  // Area Labels are rendered as ReferenceLines
  // minValue is the smallest value in the dataset, maxValue is the largest (x-axis)
  renderAreaLabels = (data, minValue, maxValue, distributionOfData) => {
    let centerOfMin   = minValue + (this.props.min - minValue) / 2;
    let centerOfMax   = this.props.max + (maxValue - this.props.max) / 2;
    let centerOfValid = this.props.min + (this.props.max - this.props.min) / 2;

    // find closest values to the "center of" variables so that it will be rendered
    let roundedValueMin = false;
    let roundedValueMax = false;
    let roundedValueValid = false;

    // function will pick the value that's closest to the center point
    let getNewRoundedValue = function(center, oldValue, newValue) {
      if (oldValue === false) {
        return newValue;
      }
      if (Math.abs(center - newValue) < Math.abs(center - oldValue)) {
        return newValue;
      }
      return oldValue;
    }

    for (let i = 0; i < data.length; i++) {
      let value = data[i]['value'];
      roundedValueMin   = getNewRoundedValue(centerOfMin, roundedValueMin, value);
      roundedValueMax   = getNewRoundedValue(centerOfMax, roundedValueMax, value);
      roundedValueValid = getNewRoundedValue(centerOfValid, roundedValueValid, value);
    }

    // a custom Component for rendering the label
    function ReferenceLabel(props) {
      const { fill, value, viewBox } = props;
      const x = viewBox.width + viewBox.x;
      let yOffset = (props.yOffset === undefined ? 0 : props.yOffset);
      const y = viewBox.y + viewBox.height - 16 - yOffset;
      return (
          <text x={x} y={y} fill={fill} fontSize={22} textAnchor="middle">
              {value}
          </text>
      )
    }


    // determine which reference lines we should actually draw
    // -> only if the area it's marking is >= 15% of the entire graph
    let fullSize = maxValue - minValue;
    let checkIfShouldRender = function(totalSize, borderLeft, borderRight) {
      return (borderRight - borderLeft > totalSize / 9);
    }

    let getLabelTextValue = function(distributionData) {
      return distributionData['total'].toLocaleString();
    }
    let getLabelTextPercent = function(distributionData, total) {
      let percent = Math.round(distributionData['total'] / total * 100, 0);
      return percent + "%";
    }

    let results = {'valid': {'val': null, 'percent': null}, 'min': {'val': null, 'percent': null}, 'max': {'val': null, 'percent': null}};
    let totalNumberOfResults = distributionOfData['min']['total'] + distributionOfData['max']['total'] + distributionOfData['valid']['total'];
    if (checkIfShouldRender(fullSize, this.props.min, this.props.max)) {
      results['valid']['val']     = (<ReferenceLine ifOverflow="extendDomain" x={roundedValueValid} strokeOpacity={0} label={<ReferenceLabel value={getLabelTextValue(distributionOfData['valid'])} fill={this.getColor('label')}/>}/>);
      results['valid']['percent'] = (<ReferenceLine ifOverflow="extendDomain" x={roundedValueValid} strokeOpacity={0} label={<ReferenceLabel value={getLabelTextPercent(distributionOfData['valid'], totalNumberOfResults)} yOffset={30} fill={this.getColor('label')}/>}/>);
    }
    if (checkIfShouldRender(fullSize, minValue, this.props.min)) {
      results['min']['val']     = (<ReferenceLine ifOverflow="extendDomain" x={roundedValueMin} strokeOpacity={0} label={<ReferenceLabel value={getLabelTextValue(distributionOfData['min'])} fill={this.getColor('label')}/>}/>);
      results['min']['percent'] = (<ReferenceLine ifOverflow="extendDomain" x={roundedValueMin} strokeOpacity={0} label={<ReferenceLabel value={getLabelTextPercent(distributionOfData['min'], totalNumberOfResults)} yOffset={30} fill={this.getColor('label')}/>}/>);
    }
    if (checkIfShouldRender(fullSize, this.props.max, maxValue)) {
      results['max']['val']     = (<ReferenceLine ifOverflow="extendDomain" x={roundedValueMax} strokeOpacity={0} label={<ReferenceLabel value={getLabelTextValue(distributionOfData['max'])} fill={this.getColor('label')}/>}/>);
      results['max']['percent'] = (<ReferenceLine ifOverflow="extendDomain" x={roundedValueMax} strokeOpacity={0} label={<ReferenceLabel value={getLabelTextPercent(distributionOfData['max'], totalNumberOfResults)} yOffset={30} fill={this.getColor('label')}/>}/>);
    }
    return results;
  }


  // Render <AreaChartFilterInput/>
  render() {
    let [data, statsAboutData, distributionOfData] = this.getFilteredData(this.props.data);
    if (this.props.simpleModeOn) {

      // simple mode
      return (
        <div style={{'height': '100%', 'width': '100%', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center'}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
               data={data}
               margin={{top: 50, right: 50, left: 20, bottom: 5,}}
             >
               <Area type="monotone" dataKey="results" stroke={this.getColor('valid')} fill={this.getColor('valid')} isAnimationActive={false}/>
               <Area type="monotone" dataKey="min-results" stroke={this.getColor('invalid')} fill={this.getColor('invalid')} isAnimationActive={false}/>
               <Area type="monotone" dataKey="max-results" stroke={this.getColor('invalid')} fill={this.getColor('invalid')} isAnimationActive={false}/>
           </AreaChart>
         </ResponsiveContainer>
        </div>
      );

    } else {

      // normal mode
      let referenceLines = this.renderReferenceLines();
      let areaLabels = this.renderAreaLabels(this.props.data, statsAboutData['min'], statsAboutData['max'], distributionOfData)

      return (
        <div style={{'height': '100%', 'width': '100%', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center'}}>
          {/* <p>Value: {this.state.hoveredValue}; Filter: {this.state.selectedFilter}</p> */}
          <ResponsiveContainer width="98%" height="98%">

            <AreaChart
               data={data}
               margin={{top: 50, right: 50, left: 20, bottom: 5,}}
               onMouseLeave={() => this.setState({hoveredValue: -1, selectedFilter: NO_FILTER})}
               onMouseUp={() => this.setState({selectedFilter: NO_FILTER})}
             >
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="value" height={70} label={{value: this.props.xAxisLabel, position: 'insideBottom', fontSize: 25}}/>
               <YAxis type="number" width={70} label={{ value: this.props.yAxisLabel, angle: -90, position: 'left', fontSize: 25}}/>
               {this.renderToolTip()}

               <Area type="monotone" dataKey="results" stroke={this.getColor('valid')} fill={this.getColor('valid')} isAnimationActive={false}/>
               <Area type="monotone" dataKey="min-results" stroke={this.getColor('invalid')} fill={this.getColor('invalid')} isAnimationActive={false}/>
               <Area type="monotone" dataKey="max-results" stroke={this.getColor('invalid')} fill={this.getColor('invalid')} isAnimationActive={false}/>

               {/* Make sure to render reference lines last so they get rendered above everything else*/}
               {referenceLines['min']}
               {referenceLines['max']}
               {areaLabels['valid']['val']}
               {areaLabels['valid']['percent']}
               {areaLabels['min']['val']}
               {areaLabels['min']['percent']}
               {areaLabels['max']['val']}
               {areaLabels['max']['percent']}

           </AreaChart>
         </ResponsiveContainer>
        </div>
      );
    }
  }
}


export default AreaChartFilterInput;
