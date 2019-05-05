// External Dependencies
import React, {Component} from 'react';

let id = 0;

class SmartSlider3FullWidth extends Component {

    static slug = 'et_pb_nextend_smart_slider_3_fullwidth';

    constructor(props) {
        super(props);

        this.iframeRef = React.createRef();
    }

    render() {
        id++;

        const style = {
            width: '100%', display: 'block', border: '0'
        };

        const title = 'et_pb_nextend_smart_slider_3_fullwidth' + id;

        return (
            <iframe title={title} ref={this.iframeRef} className="n2-ss-slider-frame" style={style} src={window.SmartSlider3BuilderData.iframeUrl + "&sliderid=" + this.props.slider} frameBorder="0"></iframe>
        );
    }

    componentDidMount() {
        let n2SSIframeLoader = window.n2SSIframeLoader;
        if (typeof n2SSIframeLoader !== 'function' && window.parent) {
            // Firefox fix
            n2SSIframeLoader = window.parent.n2SSIframeLoader;

            const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
            window[eventMethod](eventMethod === "attachEvent" ? "onmessage" : "message", function (e) {
                const messageEvent = new MessageEvent('message', {data: e.data, origin: e.origin, source: e.source});
                window.parent.dispatchEvent(messageEvent);
            })
        }
        this.iframeRef.current.addEventListener('load', function (e) {
            n2SSIframeLoader(e.target);
        });
    }
}

export default SmartSlider3FullWidth;
