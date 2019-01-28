class ParseError {
	constructor(code, description, severity) {
		this.code = code;
		this.description = description;
		this.severity = severity;
	}
}

export default ParseError;
