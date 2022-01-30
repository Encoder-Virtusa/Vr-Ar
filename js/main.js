AFRAME.registerComponent('cursor-listener', {
    init: function() {
        this.el.addEventListener('mouseenter', function(evt) {
            this.setAttribute("animation", "property: scale; to: 1.2 1.2 1; loop: fasle; dur: 100");
            console.log('I was clicked at: ', evt.detail.intersection.point);
        });

        this.el.addEventListener('mouseleave', function(evt) {
            this.setAttribute("animation", "property: scale; to: 1 1 0.94; loop: false; dur: 100");
            console.log('I was clicked at: ', evt.detail.intersection.point);
        });

    }
});