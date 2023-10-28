import actions from '../actions';

const initialState = {
  loading: false,
  objects: [],
  exploreObjects: [],
  explorePage: 1,
  comments: [],
  selected: null,
  editor: { tool: 'straight', colour: 'orange', view: 'interlacement', autoExtend: true },
};

function objects(state = initialState, action) {
  switch (action.type) {
    case actions.objects.RECEIVE_OBJECTS: {
      const objects = Object.assign([], state.objects);
      action.objects.forEach(g => {
        let found = false;
        objects.forEach(g2 => {
          if (g2._id === g._id) {
            found = true;
            g2 = Object.assign({}, g2, g);
          }
        });
        if (!found) objects.push(g);
      });
      return Object.assign({}, state, { loading: false, objects });
    }
    case actions.objects.RECEIVE_OBJECT:
      const objects = [];
      let found = false;
      state.objects.forEach((object) => {
        if (object._id === action.object._id) {
          object = Object.assign({}, action.object);
          found = true;
        }
        objects.push(object);
      });
      if (!found) objects.push(action.object);
      return Object.assign({}, state, { loading: false, objects });
    case actions.objects.RECEIVE_EXPLORE_OBJECTS:
      const newObjects = Object.assign([], state.exploreObjects);
      action.objects?.forEach(o => newObjects.push(o));
      return Object.assign({}, state, { exploreObjects: newObjects, explorePage: state.explorePage + 1 });
    case actions.objects.CREATE_OBJECT:
      const objectList = state.objects;
      objectList.push(action.object);
      return Object.assign({}, state, {
        loading: false,
        objects: objectList,
      });
    case actions.objects.UPDATE_OBJECT: {
      const objects = Object.assign([], state.objects).map((o) => {
        if (o._id === action.id) {
          const obj = Object.assign({}, o);
          obj[action.field] = action.value;
          return obj;
        }
        return o;
      });
      return Object.assign({}, state, { objects });
    }
    case actions.objects.DELETE_OBJECT:
      let index;
      state.objects.forEach((d, i) => {
        if (d._id === action.id) index = i;
      });
      if (index > -1) state.objects.splice(index, 1);
      return Object.assign({}, state, {
        loading: false,
        objects: state.objects,
      });
    case actions.objects.SELECT_OBJECT: {
      return Object.assign({}, state, { selected: action.id });
    }
    case actions.objects.UPDATE_EDITOR:
      const editor = Object.assign({}, state.editor, action.editor);
      return Object.assign({}, state, { editor });

    case actions.objects.RECEIVE_COMMENT: {
      let found = false;
      const comments = state.comments.map(e => {
        if (e._id === action.comment._id) {
          found = e;
          return action.comment;
        }
        return e;
      });
      if (!found) {
        comments.push(action.comment);
        found = action.comment;
      }
      const objects = state.objects.map(o => {
        if (o._id === found?.object) {
          o.commentCount = comments.filter(c => c.object === o._id).length;
        }
        return o;
      });
      return Object.assign({}, state, { comments, objects });
    }
    case actions.objects.DELETE_COMMENT: {
      return Object.assign({}, state, { comments: state.comments.filter(e => e._id !== action.commentId) });
    }
    default:
      return state;
  }
}

export default objects;
