import { WTooltip } from './left.jsx';

function WMidPanel(_props) {
  return (
    <WTooltip body="?">
      <span dangerouslySetInnerHTML={{
        __html: $I("mid.buildings.tip")
      }} />
    </WTooltip>
  );
}

export { WMidPanel };
window.WMidPanel = WMidPanel;
