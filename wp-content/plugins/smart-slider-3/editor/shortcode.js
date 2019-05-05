(function () {
    tinymce.create('tinymce.plugins.nextend2smartslider3', {
        init: function (ed, url) {
            ed.addButton('nextend2smartslider3', {
                title: 'Smart Slider 3',
                image: url + '/../images/icon20x.png',
                onclick: function () {
                    NextendSmartSliderWPTinyMCEModal(ed);
                }
            });
        },
        createControl: function (n, cm) {
            return null;
        },
        getInfo: function () {
            return {
                longname: "Smart Slider 3",
                author: 'Nextendweb',
                authorurl: 'https://smartslider3.com',
                infourl: 'https://smartslider3.com',
                version: "3.2"
            };
        }
    });
    tinymce.PluginManager.add('nextend2smartslider3', tinymce.plugins.nextend2smartslider3);
})();