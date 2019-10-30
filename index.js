const input = `5 3
1 1 E
RFRFRFRF

3 2 N
FRRFLLFFRRFLL

0 3 W
LLFFFLFLFL`;

const parseCoordinatesStr = str => (
  str.split(' ').reduce((acc, item) => [
    ...acc, 
    parseInt(item.trim(), 10)
  ], [])
)

const reduceToRobotsCommandsArr = rawCommands => rawCommands.reduce((acc, line) => {
  if ((!acc.length && line) || (acc && line === '')) {
    acc.push([]);
  }

  if (line) {
    acc[acc.length - 1].push(line);
  }

  return acc;
}, []);

const parseRobotsCommands = rawRobotsCommands => (
  rawRobotsCommands.map(([posAndDir, instructionsStr]) => {
    const position = parseCoordinatesStr(posAndDir.slice(0, -2))
    const direction = posAndDir.slice(-1);
    const instructions = [...instructionsStr];

    return {
      position,
      direction,
      instructions
    }
  })
);

const parseInput = (inputStr) => {
  const [
    edgeStr,
    ...rawRobotsCommands
  ] = inputStr.split('\n');
  
  const edge = parseCoordinatesStr(edgeStr);
  const commands = parseRobotsCommands(
    reduceToRobotsCommandsArr(rawRobotsCommands)
  );

  return {
    edge,
    commands
  }
};

const CLOCKWISE_DIRECTIONS_MAP = ['N', 'E', 'S', 'W'];
const POSITION_REDUCERS = {
  N: ([x, y]) => ([x, y + 1]),
  E: ([x, y]) => ([x + 1,  y]),
  S: ([x, y]) => ([x,  y - 1]),
  W: ([x, y]) => ([x - 1,  y]),
};

const instructionReducers = {
  L: ({ direction: currentDirection, ...rest }) => {
    const currentDirectionIndex = CLOCKWISE_DIRECTIONS_MAP.findIndex(item => (
      currentDirection === item
    ));

    const direction = currentDirectionIndex
      ? CLOCKWISE_DIRECTIONS_MAP[currentDirectionIndex - 1]
      : CLOCKWISE_DIRECTIONS_MAP[CLOCKWISE_DIRECTIONS_MAP.length - 1];

    return {
      direction,
      ...rest,
    }
  },

  R: ({ direction: currentDirection, ...rest }) => {
    const currentDirectionIndex = CLOCKWISE_DIRECTIONS_MAP.findIndex(item => (
      currentDirection === item
    ));

    const direction = currentDirectionIndex === CLOCKWISE_DIRECTIONS_MAP.length - 1
      ? CLOCKWISE_DIRECTIONS_MAP[0]
      : CLOCKWISE_DIRECTIONS_MAP[currentDirectionIndex + 1];

    return {
      direction,
      ...rest,
    }
  },

  F: ({ direction, position: currentPosition, ...rest }) => ({
    position: POSITION_REDUCERS[direction](currentPosition),
    direction,
    ...rest,
  }),
};

const runCmd = (edge, command, scent = []) => {
  const initialState = {
    position: command.position,
    direction: command.direction,
    scent,
    lost: false,
  };

  const res = command.instructions.reduce((state, instruction) => {
    const newState = {
      ...state,
      ...instructionReducers[instruction](state),
    };

    const lost = state.lost 
      || newState.position[0] < 0
      || newState.position[1] < 0
      || newState.position[0] > edge[0]
      || newState.position[1] > edge[1];

    if (lost && !state.lost) {
      newState.scent = [
        ...newState.scent,
        newState.position,
      ] 
    }

    return lost && scent.find(([x, y]) => newState.position[0] === x && newState.position[1] === y) 
      ? state
      : { ...newState, lost };
  }, initialState);

  return res;
};

const parseResult = ({ direction, position, lost }) => (
  `${position.join(' ')} ${direction} ${lost ? 'LOST' : ''}`.trim()
);

const init = () => {
  const {
    edge,
    commands,
  } = parseInput(input);

  commands.reduce((scent, command) => {
    const { 
      scent: newScent, 
      ...result
    } = runCmd(edge, command, scent);

    console.log(parseResult(result));
    return newScent;
  }, []);
};

init();