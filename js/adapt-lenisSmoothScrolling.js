define(['core/js/adapt', 'libraries/lenis'], function (Adapt, Lenis) {
  var LenisSmoothScrolling = Backbone.Controller.extend({
    initialize: function () {
      this.listenToOnce(Adapt, 'router:location', this.onAdaptInitialize);
      this.listenTo(Adapt, {
        'notify:opened': this.onNotifyOpened,
        'notify:closed': this.onNotifyClosed
      });
      this.handleScroll();
    },

    onAdaptInitialize: function () {
      if (!Adapt.course.get('_lenisSmoothScrolling') || !Adapt.course.get('_lenisSmoothScrolling')._isEnabled) {
        return;
      }
      this.handleScroll();
      if (Adapt.GSAP && Adapt.GSAP.isEnabled()) {
        return this.setupGsap();
      }

      this.setup();
    },

    setupGsap: function () {
      this.lenis = new Lenis();
      this.lenis.on('scroll', (e) => {
        this.handleScroll();
        Adapt.GSAP.ScrollTrigger.update();
      });
      const self = this;
      Adapt.GSAP.lib.ticker.add((time) => {
        self.lenis.raf(time * 1000);
      });

      Adapt.GSAP.lib.ticker.lagSmoothing(0);
    },

    setup: function () {
      this.lenis = new Lenis();
      this.lenis.on('scroll', this.handleScroll);
      const self = this;
      function raf(time) {
        self.lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    },

    handleScroll: function () {
      const scrollTop = document.documentElement.scrollTop;
      Adapt.trigger('lenis:scroll', scrollTop);
    },

    onNotifyOpened: function (view) {
      view.$el.attr('data-lenis-prevent', '');
      this.lenis.stop();
    },

    onNotifyClosed: function () {
      this.lenis.start();
    }
  });
  return new LenisSmoothScrolling();
});
