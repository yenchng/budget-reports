import React, { Component } from "react";
import PropTypes from "prop-types";
import keys from "lodash/fp/keys";
import sortBy from "lodash/fp/sortBy";
import uniq from "lodash/fp/uniq";
import { keyByProp, sumByProp } from "../dataUtils";
import { Arc } from "@vx/shape";
import { Group } from "@vx/group";

const colors = [
  "#8dd3c7",
  "#ffffb3",
  "#bebada",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#b3de69",
  "#fccde5",
  "#d9d9d9",
  "#bc80bd",
  "#ccebc5",
  "#ffed6f"
];

const ANIMATION_DURATION = 300;

const addAngles = data => {
  const totalValue = sumByProp("value")(data);
  let angle = 0;

  return sortBy("value")(data)
    .reverse()
    .map(d => {
      const startAngle = angle;
      angle += d.value / totalValue * 2 * Math.PI;

      return { ...d, startAngle, endAngle: angle };
    });
};

const interpolate = (prevData, currData, progress) => {
  const prevDataById = keyByProp("id")(prevData);
  const currDataById = keyByProp("id")(currData);
  const ids = uniq(keys(prevDataById).concat(keys(currDataById)));

  return ids.map(id => {
    const previous = prevDataById[id] || {
      startAngle: 2 * Math.PI,
      endAngle: 2 * Math.PI,
      value: 0
    };
    const current = currDataById[id] || {
      startAngle: 2 * Math.PI,
      endAngle: 2 * Math.PI,
      value: 0
    };

    return {
      ...previous,
      ...current,
      startAngle:
        previous.startAngle +
        progress * (current.startAngle - previous.startAngle),
      endAngle:
        previous.endAngle + progress * (current.endAngle - previous.endAngle),
      value: previous.value + progress * (current.value - previous.value)
    };
  });
};

class SunburstChart extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
      })
    ).isRequired
  };

  static defaultProps = { width: 200, height: 200 };

  state = {
    previousData: null,
    currentData: null,
    animationStartTime: null
  };

  static getDerivedStateFromProps(props, state) {
    if (!state.currentData) {
      return { currentData: props.data };
    }

    if (!state.animationStartTime && props.data !== state.currentData) {
      return {
        animationStartTime: new Date().getTime(),
        previousData: state.currentData,
        currentData: props.data
      };
    }

    return null;
  }

  componentDidUpdate() {
    const { animationStartTime } = this.state;

    if (animationStartTime) {
      if (new Date().getTime() - animationStartTime >= ANIMATION_DURATION) {
        this.setState({
          previousData: null,
          animationStartTime: null
        });
      } else {
        requestAnimationFrame(() => {
          this.forceUpdate();
        });
      }
    }
  }

  render() {
    const { width, height } = this.props;
    const { previousData, currentData, animationStartTime } = this.state;
    const radius = Math.min(width, height) / 2;

    const data = animationStartTime
      ? interpolate(
        addAngles(previousData),
        addAngles(currentData),
        (new Date().getTime() - animationStartTime) / ANIMATION_DURATION
      )
      : addAngles(currentData);

    return (
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="none" />
        <Group top={height / 2} left={width / 2}>
          <Arc
            data={{ value: 1 }}
            fill="#f5f5f5"
            startAngle={0.001}
            endAngle={2 * Math.PI}
            outerRadius={radius}
            innerRadius={radius - 35}
          />
          {sortBy("id")(data).map(d => (
            <Arc
              key={d.id}
              data={d}
              startAngle={d.startAngle}
              endAngle={d.endAngle}
              outerRadius={radius}
              innerRadius={radius - 35}
              fill={colors[d.label.length % colors.length]}
              padAngle={0}
              onClick={data => event => {
                console.log("data:", data);
                console.log("event:", event);
              }}
            />
          ))}
        </Group>
      </svg>
    );
  }
}

export default SunburstChart;
