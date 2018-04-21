const React = require("react");
const { connect } = require("react-redux");
const { Button, ButtonGroup, Switch, Label, Collapse, Popover, Slider, Tabs, Tab } = require("@blueprintjs/core");
const { DateRangePicker } = require("@blueprintjs/datetime");
const { SketchPicker } = require("react-color");
const debounce = require("lodash.debounce");
const moment = require("moment");
const onClickOutside = require("react-onclickoutside").default;

const { HELP_SLIDE_ORDER, DEFAULT_DATE_FORMAT, INTERVAL_VALUES } = require("../constans/index");

const {
  setInterval,
  setSpeed,
  setDateSpan,
  setMapBackground,
  setFeatureStyle,
  setMetadata,
  showPopover,
  hidePopover,
  setTutorialModeOff,
  goToNextInTutorial,
  changeSidebarTab
} = require("../actions");

const { capitalizeFirstLetter, rgbaObjectToString, isDateSpanAllowed } = require("../utils");

// TODO: Maybe add another handler at onClickOutside?
class HelpPopover extends React.Component {
  handleClickOutside(ev) {
    const className = ev.target.className;
    const parentClassName = ev.target.parentNode.className;

    if (
      className === "pt-button-text" ||
      className === "pt-button action-button" ||
      className === "help-popover" ||
      className === "help-content" ||
      parentClassName === "pt-button close-button" ||
      parentClassName === "help-popover"
    ) {
      return;
    }

    this.props.setTutorialModeOff();
  }

  render() {
    const {
      helpText,
      id,
      tutorialMode,
      visiblePopovers,
      showPopover,
      hidePopover,
      setTutorialModeOff,
      goToNextInTutorial
    } = this.props;

    const slideIndex = HELP_SLIDE_ORDER.findIndex(slideId => id === slideId);
    const isLast = slideIndex >= HELP_SLIDE_ORDER.length - 1;
    return (
      <Popover
        isOpen={visiblePopovers.includes(id)}
        onClose={() => hidePopover(id)}
        preventOverflow={{ enabled: true, boundariesElement: "scrollParent" }}
        content={
          <div className="help-popover" onClick={ev => ev.stopPropagation()}>
            <Button className="close-button" icon="cross" onClick={() => setTutorialModeOff() && hidePopover(id)} />
            <div className="help-content">
              Help Text For {helpText}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque mauris ipsum,
              lobortis vel aliquet quis, elementum nec purus. Maecenas egestas risus varius, maximus sem quis, efficitur
              purus. Donec vitae mauris vitae sapien sagittis accumsan et non diam. Fusce maximus, nunc sit amet tempus
              posuere, odio odio malesuada ligula, nec pretium sapien lectus eget lectus. Ut vitae orci a quam pulvinar
              consequat. Sed aliquam sapien vitae quam blandit, ut hendrerit nulla posuere. Nunc porttitor nulla id
              tincidunt placerat.
            </div>
            {tutorialMode && (
              <Button
                className="action-button"
                onClick={ev => {
                  ev.stopPropagation();
                  isLast
                    ? hidePopover(id) && setTutorialModeOff() && changeSidebarTab("simpleEdit")
                    : goToNextInTutorial(id);
                }}
              >
                {isLast ? "Close" : "Next"}
              </Button>
            )}
          </div>
        }
        target={
          <Button
            className="help-button"
            icon="help"
            onClick={ev => {
              ev.stopPropagation();
              showPopover(id);
            }}
          />
        }
      />
    );
  }
}

const HelpPopoverConnected = connect(
  ({ ui }) => ({ tutorialMode: ui.tutorialMode, visiblePopovers: ui.visiblePopoversIds }),
  {
    showPopover,
    hidePopover,
    setTutorialModeOff,
    goToNextInTutorial
  }
)(onClickOutside(HelpPopover));

const SidebarPanelHeader = ({ title, helpText, id, isOpen = false, onToggleClick }) => (
  <div className="sidebar-header" onClick={onToggleClick}>
    <h5>{title}</h5>
    <div>
      <HelpPopoverConnected helpText={helpText} id={id} />
      <Button icon={isOpen ? "chevron-down" : "chevron-up"} />
    </div>
  </div>
);

const DescribePanel = ({ isOpen, metadata, setMetadata, onToggleClick }) => (
  <div className="sidebar-panel">
    <SidebarPanelHeader
      title="Describe"
      helpText="Describe"
      isOpen={isOpen}
      onToggleClick={onToggleClick}
      id="describe-help"
    />
    <Collapse isOpen={isOpen}>
      <div className="inside-content">
        <Label text="Name" required={true}>
          <input className="pt-input" value={metadata.name} onChange={ev => setMetadata("name", ev.target.value)} />
        </Label>
        <Label text="Description" required={true}>
          <textarea
            className="pt-input"
            value={metadata.description}
            onChange={ev => setMetadata("description", ev.target.value)}
          />
        </Label>
        <Label text="Project" required={true}>
          <input
            className="pt-input"
            value={metadata.project}
            onChange={ev => setMetadata("project", ev.target.value)}
          />
        </Label>
      </div>
    </Collapse>
  </div>
);

const DatePanel = ({ isOpen, onToggleClick, date, onChangeDate, onChangeInterval, onChangeSpeed }) => (
  <div className="sidebar-panel">
    <SidebarPanelHeader title="Dates" helpText="Dates" isOpen={isOpen} onToggleClick={onToggleClick} id="dates-help" />
    <Collapse isOpen={isOpen}>
      <div className="inside-content">
        <DateRangePicker
          shortcuts={false}
          contiguousCalendarMonths={false}
          value={[new Date(date.start || date.end), date.end ? new Date(date.end) : null]}
          onChange={onChangeDate}
        />
      </div>
      <div className="inside-content interval-selection">
        <label className="inline-label">
          Interval:
          <ButtonGroup>
            {INTERVAL_VALUES.map(v => (
              <Button
                key={v}
                active={date.interval === v}
                disabled={!isDateSpanAllowed(v, date)}
                onClick={() => onChangeInterval(v)}
              >
                {capitalizeFirstLetter(v)}
              </Button>
            ))}
          </ButtonGroup>
        </label>
      </div>
      <div className="inside-content">
        <label className="inline-label">Animation speed</label>
        <Slider min={1} max={5} stepSize={1} value={date.speed} onChange={onChangeSpeed} labelStepSize={1} />
      </div>
    </Collapse>
  </div>
);

const StyleSwitch = ({ name, value, onChange }) => (
  <div>
    <label className="inline-label">
      {capitalizeFirstLetter(name)}
      <Switch checked={value} onChange={() => onChange(!value)} />
    </label>
  </div>
);

class StyleColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { displayColorPicker: false };
    this.onColorChange = debounce(this.onColorChange, 200);
  }

  onColorChange = color => {
    this.props.onChange(color.rgb);
  };

  onCloseClick = () => {
    this.setState({ displayColorPicker: false });
  };

  onOpenClick = () => {
    this.setState({ displayColorPicker: true });
  };

  render() {
    return (
      <div>
        <label className="inline-label">
          {capitalizeFirstLetter(this.props.name.replace("-", " "))}
          <div className="color-picker">
            <div className="color-picker__swatch" onClick={this.onOpenClick}>
              <div className="color-picker__color" style={{ background: rgbaObjectToString(this.props.value) }} />
            </div>
            {this.state.displayColorPicker ? (
              <div className="popover">
                <div className="cover" onClick={this.onCloseClick} />
                <SketchPicker color={this.props.value} onChange={this.onColorChange} />
              </div>
            ) : null}
          </div>
        </label>
      </div>
    );
  }
}

const StyleNumberPicker = ({ name, value, onChange }) => {
  return (
    <div>
      <label className="inline-label">
        {capitalizeFirstLetter(name.replace("-", " "))}
        <input type="number" min={0} max={10} step={0.1} value={value} onChange={ev => onChange(ev.target.value)} />
      </label>
    </div>
  );
};

const STYLE_TO_COMPONENT = {
  enabled: StyleSwitch,
  "line-color": StyleColorPicker,
  "line-width": StyleNumberPicker
};

const StyleEnabledButton = ({ enabled, onClick }) => (
  <Button className="pt-minimal eye-icon" icon={`eye-${enabled ? "open" : "off"}`} onClick={() => onClick(!enabled)} />
);

const StylePart = ({ style, onChange }) => {
  return React.createElement(
    "div",
    null,
    Object.keys(style).map(styleKey => {
      const component = STYLE_TO_COMPONENT[styleKey];
      return React.createElement(component, {
        key: styleKey,
        name: styleKey,
        value: style[styleKey],
        onChange: newValue => onChange(Object.assign({}, style, { [styleKey]: newValue }))
      });
    })
  );
};

const StyleSection = ({ style, onStyleChange }) => {
  return (
    <div className="inside-content section">
      <div className="section__header">
        <h4>{capitalizeFirstLetter(style.name)}</h4>
        <StyleEnabledButton
          enabled={style.enabled}
          onClick={newValue => onStyleChange(Object.assign({}, style, { enabled: newValue }))}
        />
      </div>
      <div className="subsection">
        <label className="inline-label">
          <h5>Base</h5>
          <StyleEnabledButton
            enabled={style.baseEnabled}
            onClick={newValue => onStyleChange(Object.assign({}, style, { baseEnabled: newValue }))}
          />
        </label>
        <StylePart
          style={style.base}
          onChange={newValue => onStyleChange(Object.assign({}, style, { base: newValue }))}
        />
      </div>
      <div className="subsection">
        <label className="inline-label">
          <h5>Highlighted</h5>
          <StyleEnabledButton
            enabled={style.highlightEnabled}
            onClick={newValue => onStyleChange(Object.assign({}, style, { highlightEnabled: newValue }))}
          />
        </label>
        <StylePart
          style={style.highlight}
          onChange={newValue => onStyleChange(Object.assign({}, style, { highlight: newValue }))}
        />
      </div>
    </div>
  );
};

const ThemeSelect = ({ styles, onBackgroundStyleChange }) => (
  <div>
    <label className="inline-label">
      Theme
      <div className="pt-select">
        <select value={styles.background} onChange={ev => onBackgroundStyleChange(ev.target.value)}>
          {["light", "dark", "basic", "streets", "bright", "satellite"].map(style => (
            <option key={style} value={style}>
              {capitalizeFirstLetter(style)}
            </option>
          ))}
        </select>
      </div>
    </label>
  </div>
);

const StylesPanel = ({ isOpen, onToggleClick, styles, onStyleChange, onBackgroundStyleChange }) => {
  return (
    <div className="sidebar-panel">
      <SidebarPanelHeader
        isOpen={isOpen}
        onToggleClick={onToggleClick}
        title="Styles"
        helpText="Styles"
        id="styles-help"
      />
      <Collapse isOpen={isOpen}>
        <div className="inside-content section">
          <div className="section__header">
            <h4>Map</h4>
          </div>
          <ThemeSelect styles={styles} onBackgroundStyleChange={onBackgroundStyleChange} />
        </div>
        {styles.features.map((style, idx) => (
          <StyleSection key={style.name} style={style} onStyleChange={newStyle => onStyleChange(idx, newStyle)} />
        ))}
      </Collapse>
    </div>
  );
};

class AdvancedEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isDescribeOpen: true, isDateOpen: true, isStylesOpen: true };
  }

  onToggleClick = name => () => {
    const propName = `is${name}Open`;
    const currentValue = this.state[propName];
    this.setState({ [propName]: !currentValue });
  };

  render() {
    const {
      meta,
      date,
      style,
      setDateSpan,
      setInterval,
      setSpeed,
      setMapBackground,
      setFeatureStyle,
      setMetadata
    } = this.props;

    const { isDescribeOpen, isDateOpen, isStylesOpen } = this.state;

    return (
      <div className="sidebar-content__inside">
        <DescribePanel
          isOpen={isDescribeOpen}
          onToggleClick={this.onToggleClick("Describe")}
          metadata={meta}
          setMetadata={setMetadata}
        />
        <DatePanel
          isOpen={isDateOpen}
          onToggleClick={this.onToggleClick("Date")}
          date={date}
          onChangeDate={setDateSpan}
          onChangeInterval={setInterval}
          onChangeSpeed={setSpeed}
        />
        <StylesPanel
          isOpen={isStylesOpen}
          onToggleClick={this.onToggleClick("Styles")}
          styles={style}
          onStyleChange={setFeatureStyle}
          onBackgroundStyleChange={setMapBackground}
        />
      </div>
    );
  }
}

const DATE_RANGE_IN_MS = {
  "three-months": 7776000000,
  month: 2592000000,
  week: 604800000,
  custom: 1209600000
};

const calcSelectDateSpan = (now, date) => {
  if (date.end === now) {
    if (date.start === now - DATE_RANGE_IN_MS["week"]) return "week";
    if (date.start === now - DATE_RANGE_IN_MS["month"]) return "month";
    if (date.start === now - DATE_RANGE_IN_MS["three-months"]) return "three-months";
  }
  return "custom";
};

const SimpleEdit = ({
  meta: metadata,
  style: styles,
  date,
  setMetadata,
  setDateSpan,
  setMapBackground,
  changeSidebarTab
}) => {
  const now = new Date().setHours(12, 0, 0, 0);
  const selectDateSpanName = calcSelectDateSpan(now, date);
  return (
    <div className="sidebar-content__inside">
      <div style={{ float: "right" }}>
        <HelpPopoverConnected helpText="Simple Mode" id="simple-tab-help" />
      </div>
      <div className="inside-content">
        <label className="inline-label">Set title for your visualization</label>
        <input
          className="pt-input"
          value={metadata.name}
          placeholder="Type your title..."
          onChange={ev => setMetadata("name", ev.target.value)}
        />
      </div>
      <div className="inside-content">
        <label className="inline-label">
          See changes from
          <div className="pt-select">
            <select
              value={selectDateSpanName}
              onChange={({ target }) => setDateSpan([now - DATE_RANGE_IN_MS[target.value], now])}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="three-months">Last Three Months</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </label>
        {selectDateSpanName === "custom" && (
          <p className="tip">
            You can change date span more precisely from{" "}
            <span className="highlighted" onClick={() => changeSidebarTab("advancedEdit")}>
              Advanced Tab
            </span>
          </p>
        )}
        <div className="date-span-range">
          <div className="range-line">
            <div className="range-marker">
              <div className="range-marker__date">{moment(date.start).format(DEFAULT_DATE_FORMAT)}</div>
            </div>
            <div className="range-marker">
              <div className="range-marker__date">{moment(date.end).format(DEFAULT_DATE_FORMAT)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="inside-content">
        <ThemeSelect styles={styles} onBackgroundStyleChange={setMapBackground} />
      </div>
    </div>
  );
};

const SidebarEdit = props => {
  return (
    <Tabs
      animate={true}
      id="SidebarEditTabs"
      className="sidebar-tabs"
      renderActiveTabPanelOnly={true}
      onChange={id => props.changeSidebarTab(id)}
      selectedTabId={props.selectedSidebarTabId}
    >
      <Tab id="simpleEdit" title="Simple" panel={<SimpleEdit {...props} />} />
      <Tab id="advancedEdit" title="Advanced" panel={<AdvancedEdit {...props} />} />
    </Tabs>
  );
};

const SidebarEditConnected = connect(
  ({ meta, date, style, ui }) => ({ meta, date, style, selectedSidebarTabId: ui.selectedSidebarTabId }),
  {
    setInterval,
    setSpeed,
    setDateSpan,
    setFeatureStyle,
    setMapBackground,
    setMetadata,
    changeSidebarTab
  }
)(SidebarEdit);

module.exports = SidebarEditConnected;
