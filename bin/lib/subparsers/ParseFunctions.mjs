export default {
	parseZapierParameters(raw) {
		return raw.map(source => {
			const parameter = {};
			switch (source.type_of) {
				case 'int':
					parameter.type = 'integer';
					break;
				case 'bool':
					parameter.type = 'boolean';
					break;
				case 'unicode':
					if (source.choices === null) {
						parameter.type = 'text';
					} else {
						parameter.type = 'select';
						parameter.options = this.parseZapierOptions(source.choices);
						if (source.list === true) {
							parameter.multiple = true;
						}
					}
					break;
				case 'text':
					parameter.type = 'text';
					parameter.multiline = true;
					break;
				case 'float':
					parameter.type = 'number';
					break;
				case 'datetime':
					parameter.type = 'date';
					break;
				case 'dict':
					parameter.type = 'collection';
					break;
				case 'file':
					parameter.type = 'file';
					break;
				case 'password':
					parameter.type = 'password';
					break;
			}
			parameter.name = source.key;
			parameter.label = source.label;
			parameter.required = source.required;
			if (source.help_text != null) {
				parameter.help = source.help_text;
			}
			if (source.default != null) {
				parameter.default = source.default;
			}
			if (source.prefill != null) {
				parameter.type = 'select';
				parameter.options = `rpc://${source.prefill.split('.')[0]}`;
			}
			return parameter;
		});
	},
	parseZapierOptions(raw) {
		raw = raw.split(',');
		return raw.map(source => {
			const lv = source.split('|');
			return {
				label: lv[1],
				value: lv[0]
			};
		});

	},
	parseZapierInterface(raw) {
		return raw.map(source => {
			const item = {};
			item.name = source.key;
			switch (source.type) {
				case 'int':
					item.type = 'integer';
					break;
				case 'bool':
					item.type = 'boolean';
					break;
				case 'unicode':
				case 'text':
					item.type = 'text';
					break;
				case 'float':
					item.type = 'number';
					break;
				case 'datetime':
					item.type = 'date';
					break;
				case 'dict':
					item.type = 'collection';
					break;
				case 'file':
					item.type = 'file';
					break;
				case 'password':
					item.type = 'password';
					break;
			}
			return item;
		});
	}
};
