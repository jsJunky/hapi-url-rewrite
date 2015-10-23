import React from 'react';


class UrlShortener extends React.Component {

	constructor(props) {
		super(props);
		this.state = {url: ''};
	}

	submitHandler() {
		console.log(this.state.url);
		var url = '/url-shortener/' + encodeURIComponent(this.state.url);
		return fetch(url, {method: "POST"}).then((response) => console.log(response));
	}

	updateUrlState(event) {
		console.log(event.target.value);
		this.setState({url: event.target.value});
		console.log(this.state);
	}

	render() {
		return (
			<div className="url-shortener">
				<input type="text" className="url-shortener-input" onChange={this.updateUrlState.bind(this)} />
				<button type="submit" onClick={this.submitHandler.bind(this)}>Submit</button>
			</div>
		);
	}
}

export default UrlShortener;