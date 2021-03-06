// //////////////////////////////////////////////////////////////////////////////////////////////////
// Nodes Reducer
// //////////////////////////////////////////////////////////////////////////////////////////////////

const defaultState = {
  title: null,
};

function nodesReducer(state = defaultState, action) {
  switch (action.type) {
    case 'CHANGE_TITLE':
      return {
        ...state,
        title: action.title,
      };
    default:
      return state;
  }
}

export default nodesReducer;
