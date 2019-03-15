import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';

import { throttle } from 'common/utils/lodash';

import {
  REDRAW_CANVAS_TIME,
  ANIMATION_PART,
  COLORS,
  FIRST_ANIMATION,
  SECOND_ANIMATION,
} from '../constants/settings';

class PageContainer extends PureComponent {
  constructor() {
    super();

    this.canvas = createRef();
    this.ratio = window.devicePixelRatio;

    const width = window.innerWidth * this.ratio;
    const height = window.innerHeight * this.ratio;

    this.deviceDiagonal = this.calculateDiagonal(width, height);

    const { offsetBetweenParts } = FIRST_ANIMATION;

    const {
      minLoaderRadius,
      increaseSpeed,
    } = SECOND_ANIMATION;

    this.state = {
      width, // canvas width
      height, // canvas height

      animationId: 0,
      animationPart: ANIMATION_PART.first, // current working animation
      cancelAnimationFrame: false,

      offset: offsetBetweenParts,
      radius: this.deviceDiagonal,
      rotateBackgroundValue: 0,

      backgroundRadiusAcceleration: 0,

      loaderRadius: 0,
      loaderRotateValue: 0,
      increaseRadius: minLoaderRadius,
      increaseSpeed,
    };

    const drawCanvasWithThrottle = throttle(this.redrawCanvas, REDRAW_CANVAS_TIME);

    window.onresize = () => drawCanvasWithThrottle();
  }

  componentDidMount() {
    const { current } = this.canvas;

    this.ctx = current.getContext('2d');

    requestAnimationFrame(this.drawAnimationParts);
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, height } = this.state;

    if (prevState.width !== width || prevState.height !== height) {
      this.deviceDiagonal = this.calculateDiagonal(width, height);
    }
  }

  calculateDiagonal = (width, height) => (
    Math.sqrt((width ** 2) + (height ** 2)) / FIRST_ANIMATION.rangeRadius
  );

  redrawCanvas = () => {
    const { innerWidth, innerHeight } = window;
    const { animationId } = this.state;

    cancelAnimationFrame(animationId);

    this.setState({
      cancelAnimationFrame: true,
      width: innerWidth * this.ratio,
      height: innerHeight * this.ratio,
    });

    requestAnimationFrame(this.drawAnimationParts);
  };

  clearCanvas = () => {
    const { width, height } = this.state;

    this.ctx.clearRect(0, 0, width, height);
  };

  rotateCanvas = () => {
    const {
      width, height, rotateBackgroundValue, cancelAnimationFrame,
    } = this.state;

    const { defaultRotateValue } = FIRST_ANIMATION;

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.ctx.clearRect(-this.deviceDiagonal, -this.deviceDiagonal, this.deviceDiagonal * 3, this.deviceDiagonal * 3);

    this.ctx.translate(halfWidth, halfHeight);

    if (cancelAnimationFrame) {
      this.ctx.rotate(rotateBackgroundValue);
    } else {
      this.ctx.rotate(defaultRotateValue);
    }

    this.ctx.translate(-halfWidth, -halfHeight);

    this.setState((prevState) => {
      const { radiusSpeed, radiusAcceleration, offsetSpeed } = FIRST_ANIMATION;
      const newRadiusValue = prevState.radius - radiusSpeed - prevState.backgroundRadiusAcceleration;

      return ({
        radius: newRadiusValue,
        cancelAnimationFrame: false,
        offset: prevState.offset - offsetSpeed,
        rotateBackgroundValue: prevState.rotateBackgroundValue + defaultRotateValue,
        backgroundRadiusAcceleration: prevState.backgroundRadiusAcceleration + radiusAcceleration,
      });
    });
  };

  drawOnePart = (startAngle, endAngle) => {
    const { partLineWidth } = FIRST_ANIMATION;
    const { main } = COLORS;
    const { width, height, radius } = this.state;

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.ctx.beginPath();
    this.ctx.arc(halfWidth, halfHeight, radius, startAngle, endAngle);
    this.ctx.lineWidth = partLineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = main;
    this.ctx.stroke();
  };

  firstAnimationPart = () => {
    const { radiusSpeed, minRadiusValue } = FIRST_ANIMATION;
    const { radius, offset, backgroundRadiusAcceleration } = this.state;

    if ((radius - radiusSpeed - backgroundRadiusAcceleration) < minRadiusValue) {
      this.clearCanvas();
      this.setState({
        animationPart: ANIMATION_PART.second,
        radius: minRadiusValue,
      });
    } else {
      this.rotateCanvas();

      this.drawOnePart(offset, Math.PI / 2 - offset); // IV quadrant
      this.drawOnePart(Math.PI / 2 + offset, Math.PI - offset); // III quadrant
      this.drawOnePart(Math.PI + offset, Math.PI + Math.PI / 2 - offset); // II quadrant
      this.drawOnePart(Math.PI + Math.PI / 2 + offset, Math.PI * 2 - offset); // I quadrant
    }
  };

  drawLoader = (startAngle, endAngle) => {
    const {
      width, height, loaderRadius, increaseRadius,
    } = this.state;

    const { loader } = COLORS;
    const { minLoaderRadius } = SECOND_ANIMATION;

    const radius = loaderRadius >= minLoaderRadius ? increaseRadius : loaderRadius;

    this.ctx.beginPath();

    this.ctx.strokeStyle = loader;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.arc(width / 2, height / 2, radius, startAngle, endAngle);
    this.ctx.stroke();
  };

  secondAnimationPart = () => {
    const {
      width, height, radius, cancelAnimationFrame, rotateBackgroundValue, loaderRotateValue, loaderRadius,
    } = this.state;

    const { main, lighterMain } = COLORS;
    const {
      minLoaderRadius,
      loaderSpeed,
      loaderOffsetBetweenParts,
      loaderAcceleration,
      defaultRotateLoaderValue,
      backgroundRadiusSpeed,
      backgroundRadiusAcceleration,
    } = SECOND_ANIMATION;

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.ctx.beginPath();

    this.ctx.translate(halfWidth, halfHeight);

    if (cancelAnimationFrame) {
      // rotateBackgroundValue need because canvas already rotated (on rotateBackgroundValue degree)
      this.ctx.rotate(rotateBackgroundValue + loaderRotateValue);
    } else {
      this.ctx.rotate(defaultRotateLoaderValue);
    }

    this.ctx.translate(-halfWidth, -halfHeight);

    const gradient = this.ctx.createRadialGradient(halfWidth, halfHeight, 0, halfWidth, halfHeight, radius);
    gradient.addColorStop(0, main);
    gradient.addColorStop(1, lighterMain);

    this.ctx.fillStyle = gradient;
    this.ctx.arc(halfWidth, halfHeight, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.drawLoader(loaderOffsetBetweenParts, Math.PI - loaderOffsetBetweenParts);
    this.drawLoader(Math.PI + loaderOffsetBetweenParts, Math.PI * 2 - loaderOffsetBetweenParts);

    //
    // this.ctx.translate(halfWidth, halfHeight);
    //
    // this.ctx.rotate(-(rotateBackgroundValue + loaderRotateValue + defaultRotateLoaderValue));
    //
    // this.ctx.translate(-halfWidth, -halfHeight);

    this.ctx.font = '22px Roboto';
    this.ctx.fillStyle = 'red';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Loading...', halfWidth, halfHeight);

    if (loaderRadius >= minLoaderRadius) {
      this.gradualIncreaseEffect();
    }

    this.setState(prevState => ({
      cancelAnimationFrame: false,
      radius: radius > this.deviceDiagonal
        ? prevState.radius
        : (prevState.radius + backgroundRadiusSpeed) * backgroundRadiusAcceleration,
      loaderRadius: prevState.loaderRadius >= minLoaderRadius
        ? minLoaderRadius
        : (prevState.loaderRadius + loaderSpeed) * loaderAcceleration,
      loaderRotateValue: prevState.loaderRotateValue + defaultRotateLoaderValue,
      // animationPart: radius > this.deviceDiagonal
      //   ? ANIMATION_PART.third
      //   : ANIMATION_PART.second,
    }));
  };

  gradualIncreaseEffect = () => {
    const { increaseRadius, increaseSpeed } = this.state;

    const {
      minLoaderRadius,
      maxLoaderRadius,
      percentOfDecrease,
      decreaseSpeedOfIncreaseSpeed,
    } = SECOND_ANIMATION;

    if (parseInt(increaseRadius, 10) >= maxLoaderRadius) {
      return;
    }

    const percentageValue = ((maxLoaderRadius - minLoaderRadius) * percentOfDecrease / 100) + minLoaderRadius;

    let finalIncreaseSpeed = increaseSpeed;

    if (increaseRadius >= percentageValue) {
      const speed = increaseSpeed - decreaseSpeedOfIncreaseSpeed;

      if (speed <= 0.1) {
        finalIncreaseSpeed = 0.1;
      } else {
        finalIncreaseSpeed = speed;
      }
    }

    this.setState(prevState => ({
      increaseRadius: prevState.increaseRadius + increaseSpeed,
      increaseSpeed: finalIncreaseSpeed,
    }));
  };

  drawAnimationParts = () => {
    const { animationPart } = this.state;

    switch (animationPart) {
      case ANIMATION_PART.first: this.firstAnimationPart(); break;
      case ANIMATION_PART.second: this.secondAnimationPart(); break;

      default: break;
    }

    if (animationPart !== ANIMATION_PART.third) {
      const animationId = requestAnimationFrame(this.drawAnimationParts);
      this.setState({ animationId });
    }
  };

  render() {
    const { width, height, loaderRadius, increaseRadius } = this.state;
    const { label } = this.props;

    // let doubleRadius;
    //
    // if (loaderRadius < increaseRadius) {
    //   doubleRadius = loaderRadius * 2;
    // }

    // const doubleRadius = (loaderRadius >= increaseRadius ? increaseRadius : loaderRadius) * 2;

    return (
      <div className="preloader">
        {/*<div className="preloader__label">*/}
          {/*{loaderRadius > 0 && (*/}
            {/*<p style={{ width: doubleRadius, height: doubleRadius }}>*/}
              {/*{label || 'Loading...'}*/}
            {/*</p>*/}
          {/*)}*/}
        {/*</div>*/}
        <canvas ref={this.canvas} width={width} height={height} />
      </div>
    );
  }
}

PageContainer.propTypes = {
  label: PropTypes.string,
};

export default PageContainer;
