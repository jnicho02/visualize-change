const {
  CHANGE_SIDEBAR_TAB,
  SHOW_POPOVER,
  HIDE_POPOVER,
  NEXT_TUTORIAL_SLIDE,
  SET_TUTORIAL_MODE_ON,
  SET_TUTORIAL_MODE_OFF,
  SHOW_EXPORT_MENU,
  HIDE_EXPORT_MENU,
  TOGGLE_SIDEBAR,
  TOGGLE_FULLSCREEN,
  SHOW_PLAYER_PANEL,
  HIDE_PLAYER_PANEL,
  EXPORT_DATA_FETCHING,
  EXPORT_DATA_FETCHED,
  EXPORT_RENDER_QUEUED,
  SET_APP_READY,
  HELP_SLIDE_ORDER,
  MAP_LOADING,
  MAP_LOADED,
  WINDOW_RESIZE,
  DEFAULT_STATE
} = require("../constans/index");

module.exports = (state = DEFAULT_STATE.ui, { type, payload }) => {
  switch (type) {
    case SET_APP_READY:
      return Object.assign({}, state, { loaded: true });
    case EXPORT_DATA_FETCHING:
      return Object.assign({}, state, { loaded: false });
    case EXPORT_DATA_FETCHED:
      return Object.assign({}, state, { loaded: true });
    case TOGGLE_SIDEBAR:
      return Object.assign({}, state, { sidebarOpen: !state.sidebarOpen });
      break;
    case TOGGLE_FULLSCREEN:
      return Object.assign({}, state, { fullScreenMode: !state.fullScreenMode, playerPanelVisible: true });
      break;
    case SHOW_PLAYER_PANEL:
      return Object.assign({}, state, { playerPanelVisible: true });
      break;
    case HIDE_PLAYER_PANEL:
      return Object.assign({}, state, { playerPanelVisible: !!state.fullScreenMode ? false : true });
      break;
    case SHOW_EXPORT_MENU:
      return Object.assign({}, state, { exportMenuOpen: true });
      break;
    case HIDE_EXPORT_MENU:
      return Object.assign({}, state, { exportMenuOpen: false, exportMenuStatus: null });
      break;
    case CHANGE_SIDEBAR_TAB:
      return Object.assign({}, state, { selectedSidebarTabId: payload });
      break;
    case SET_TUTORIAL_MODE_ON:
      // TODO: This is not elastic, rethink this
      return Object.assign({}, state, {
        tutorialMode: true,
        visiblePopoversIds: [HELP_SLIDE_ORDER[0]],
        selectedSidebarTabId: "basicEdit"
      });
      break;
    case SET_TUTORIAL_MODE_OFF:
      return Object.assign({}, state, { tutorialMode: false });
      break;
    case SHOW_POPOVER:
      return Object.assign({}, state, { visiblePopoversIds: state.visiblePopoversIds.concat(payload) });
      break;
    case HIDE_POPOVER:
      return Object.assign({}, state, { visiblePopoversIds: state.visiblePopoversIds.filter(id => id !== payload) });
      break;
    case NEXT_TUTORIAL_SLIDE: {
      // TODO: Rethink
      const currentIndex = HELP_SLIDE_ORDER.findIndex(id => id === payload);
      const nextSlideId = HELP_SLIDE_ORDER[currentIndex + 1] || HELP_SLIDE_ORDER[0];

      return Object.assign({}, state, {
        // TODO: Extract to a constans?
        selectedSidebarTabId: payload === "basic-tab-help" ? "advancedEdit" : state.selectedSidebarTabId,
        visiblePopoversIds: state.visiblePopoversIds.filter(id => id !== payload).concat(nextSlideId)
      });
      break;
    }
    case EXPORT_RENDER_QUEUED:
      return Object.assign({}, state, { exportMenuStatus: "queued" });
      break;
    case MAP_LOADING:
      return Object.assign({}, state, { mapLoaded: false });
      break;
    case MAP_LOADED:
      return Object.assign({}, state, { mapLoaded: true });
      break;
    case WINDOW_RESIZE:
      return Object.assign({}, state, { windowSize: payload });
    default:
      return state;
  }
};
