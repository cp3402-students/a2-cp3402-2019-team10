(function (callback) {
    N2Classes.WindowManager.get().addWindow("imagechooser");

    var attributes = {
        states: [new wp.media.controller.Library({
            filterable: "all",
            priority: 20
        })]
    };
    /*
    filterable: 'uploaded',
    library: wp.media.query({ type: 'image' }),
     */

    if (typeof wp.media.controller.EditImage !== 'undefined') {
        attributes.states.push(new wp.media.controller.EditImage());
    }

    var frame = wp.media(attributes);

    // edit image view
    // source: media-views.js:2410 editImageContent()
    frame.on("content:render:edit-image", function () {

        var image = this.state().get("image"),
            view = new wp.media.view.EditImage({model: image, controller: this}).render();

        this.content.set(view);

        // after creating the wrapper view, load the actual editor via an ajax call
        view.loadEditor();

    }, frame);

    frame.on("select", $.proxy(function () {
        var attachment = frame.state().get("selection").first().toJSON();
        callback(this.make(attachment.url), {alt: attachment.alt});
    }, this));
    frame.on("close", function () {
        N2Classes.WindowManager.get().removeWindow();
        setTimeout(function () {
            N2Classes.Esc.pop();
        }, 50)
    });
    N2Classes.Esc.add(function () {
        return false;
    });
    frame.open();
})