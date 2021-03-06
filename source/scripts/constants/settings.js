export const REDRAW_CANVAS_TIME = 300;
export const TEXT_INSIDE_LOADER = 'LOADING';

export const ANIMATION_PART = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
};

export const FIRST_ANIMATION = {
  rangeRadius: 1.9,
  defaultRotateValue: Math.PI / 100,
  minRadiusValue: 1,
  radiusSpeed: 5,
  radiusAcceleration: 0.2,
  offsetBetweenParts: 0.4,
  offsetSpeed: 0.001,
  partLineWidth: 20,
};

export const SECOND_ANIMATION = {
  loaderSpeed: 3,
  loaderAcceleration: 1.1,
  loaderOffsetBetweenParts: 0.6,
  defaultRotateLoaderValue: Math.PI / 50,
  slowdownRotate: 0.0007,
  minLoaderRadius: 150,
  maxLoaderRadius: 200,

  backgroundRadiusSpeed: 5,
  backgroundRadiusAcceleration: 1.15,

  increaseSpeed: 0.3,
  decreaseSpeedOfIncreaseSpeed: 0.005,
  percentOfDecrease: 20,

  minTextAlpha: 0.3,
  maxTextAlpha: 1,
  textAlphaSpeed: 0.008,
};

export const THIRD_ANIMATION = {
  maxTwistedValue: 250,
  twistDuration: 20,
  twistSpeedFirstPart: 0.15,
  twistSpeedSecondPart: 0.005,
  twistSpeedThirdPart: 0.2,
  radiusSpeedFirstPart: 5,
  radiusSpeedSecondPart: 0.1,
  radiusSpeedThirdPart: 10,
};

export const FOURTH_ANIMATION = {
  circleLineWidth: 4,
  defaultClearCircleRadius: 0,
  clearCircleRadiusSpeed: 1,
  clearCircleRadiusAcceleration: 1.2,
};

export const COLORS = {
  main: '#700000',
  lighterMain: '#FF6633',
  white: '#ffffff',
};
