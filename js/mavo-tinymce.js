(function($) {

var parser, serializer;

Mavo.Plugins.register("tinymce", {
	ready: Promise.all([
		$.include(self.tinymce, "https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/tinymce.min.js"),
		$.load("https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/themes/modern/theme.min.js"),
		$.load("https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/plugins/tabfocus/plugin.js"),
		$.load("https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/plugins/paste/plugin.js"),
		$.load("https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/plugins/lists/plugin.js")
	]).then(() => {
		parser = new tinymce.html.DomParser();
		serializer = new tinymce.html.Serializer();
	})
});

Mavo.Elements.register(".tinymce", {
	hasChildren: true,
	default: true,
	edit: function() {
		this.preEdit.then(evt => {
			if (this.element.tinymce) {
				// Previously edited, we already have an editor
				tinymce.EditorManager.execCommand("mceAddEditor", true, this.element.tinymce.id);
				return;
			}

			// Init for the first time
			tinymce.init({
				target: this.element,
				inline: true,
				menubar: false,
				toolbar: "bold italic | bullist numlist",
				plugins: "image code link table lists media tabfocus"
			}).then(editors => {
				this.element.tinymce = editors[0];

				this.element.tinymce.on("change keyup paste cut", evt => {
					this.value = this.getValue();
				});
			});
		});
	},
	done: function() {
		if (this.tinymce) {
			tinymce.EditorManager.execCommand("mceRemoveEditor", true, this.tinymce.id);
		}
	},
	getValue: (element) => {
		return element.tinymce ? element.tinymce.getContent() : element.innerHTML;
	},
	setValue: (element, value) => {
		const content = serializer.serialize(parser.parse(value));

		if (!element.tinymce) {
			element.innerHTML = content;
		}
		else if (element.tinymce.isHidden()) {
			element.tinymce.setContent(content);
		}
	}
});

})(Bliss);
