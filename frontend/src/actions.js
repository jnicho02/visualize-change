const moment = require("moment");
const { push } = require("react-router-redux");
const { createExportConfig } = require("./utils");

const {
  CHANGE_INTERVAL,
  SET_DATES,
  SET_SELECTED_DATE,
  SET_COORDINATES,
  TOGGLE_PLAY,
  SET_MAP_BACKGROUND,
  SET_FEATURE_STYLE,
  SHOW_EXPORT_MENU,
  HIDE_EXPORT_MENU,
  TOGGLE_SIDEBAR,
  TOGGLE_FULLSCREEN,
  SHOW_PLAYER_PANEL,
  HIDE_PLAYER_PANEL,
  SET_METADATA,
  EXPORT_DATA_FETCHING,
  EXPORT_DATA_FETCHED,
  EXPORT_DATA_SAVING,
  EXPORT_DATA_SAVED,
  SET_APP_READY
} = require("./constans");

// inspired by Flux Standard Action
const action = (type, payload) => {
  if (typeof payload === "undefined") {
    return { type };
  }
  return { type, payload };
};

const sendToRenderer = ({ email, format, size, fps }) => (dispatch, getState) => {
  const { map, date, style } = getState();

  const mapConfig = Object.assign({}, map, {
    startDate: date.start,
    endDate: date.end,
    interval: date.interval,
    email,
    fps,
    format,
    size,
    style: style
  });

  fetch("/api/queue-render", {
    headers: {
      "Content-Type": "application/json"
    },
    method: "post",
    body: JSON.stringify(mapConfig)
  }).then(res => console.log(res));
};

const exportDataFetching = data => action(EXPORT_DATA_FETCHING, data);
const exportDataFetched = data => action(EXPORT_DATA_FETCHED, data);
const exportDataSaving = () => action(EXPORT_DATA_SAVING);
const exportDataSaved = () => action(EXPORT_DATA_SAVED);

const createNewExport = parentId => (dispatch, getState) => {
  const config = createExportConfig(getState());

  dispatch(exportDataSaving());

  fetch("/api/exports", {
    headers: {
      "Content-Type": "application/json",
      credentials: "include"
    },
    method: "POST",
    body: JSON.stringify({ parentId, config: config })
  })
    .then(res => res.json())
    .then(id => {
      dispatch(push(`/edit/${id}`));
      dispatch(exportDataSaved());
    });
};

const getExportById = id => dispatch => {
  dispatch(exportDataFetching);
  fetch(`/api/exports/${id}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include"
    },
    method: "GET"
  })
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        dispatch(exportDataFetched({ config: data[0].config }));
      }
    });
};

module.exports = {
  setInterval: interval => action(CHANGE_INTERVAL, interval),
  setDateSpan: ([start, end]) => action(SET_DATES, { start: moment(start).valueOf(), end: moment(end).valueOf() }),
  setSelectedDate: date => action(SET_SELECTED_DATE, date),
  setCoordinates: coordinates => action(SET_COORDINATES, coordinates),
  togglePlay: () => action(TOGGLE_PLAY),

  setMapBackground: background => action(SET_MAP_BACKGROUND, background),
  setFeatureStyle: (selectedIndex, newStyle) => action(SET_FEATURE_STYLE, { selectedIndex, newStyle }),

  showExportMenu: () => action(SHOW_EXPORT_MENU),
  hideExportMenu: () => action(HIDE_EXPORT_MENU),
  toggleSidebar: () => action(TOGGLE_SIDEBAR),
  toggleFullscreen: () => action(TOGGLE_FULLSCREEN),
  showPlayerPanel: () => action(SHOW_PLAYER_PANEL),
  hidePlayerPanel: () => action(HIDE_PLAYER_PANEL),

  setMetadata: (name, value) => action(SET_METADATA, { name, value }),

  sendToRenderer,
  getExportById,
  createNewExport,
  setAppReady: () => action(SET_APP_READY)
};
