import Adapt from 'core/js/adapt';
import Lenis from 'libraries/lenis';

class LenisSmoothScrolling extends Backbone.Controller {
  initialize() {
    this.listenToOnce(Adapt, 'router:location', this.onAdaptInitialize);
    this.listenTo(Adapt, {
      'notify:opened': this.onNotifyOpened,
      'notify:closed': this.onNotifyClosed
    });
    this.handleScroll();
  }

  static get courseConfig() {
    return Adapt.course.get('_lenisSmoothScrolling');
  }

  onAdaptInitialize() {
    if (!LenisSmoothScrolling.courseConfig || !LenisSmoothScrolling.courseConfig._isEnabled) {
      return;
    }
    this.handleScroll();
    if (Adapt.GSAP && Adapt.GSAP.isEnabled()) {
      return this.setupGsap();
    }

    this.setup();
  }

  setupGsap() {
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
  }

  setup() {
    this.lenis = new Lenis();
    this.lenis.on('scroll', this.handleScroll);
    const self = this;
    function raf(time) {
      self.lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  handleScroll() {
    const scrollTop = document.documentElement.scrollTop;
    Adapt.trigger('lenis:scroll', scrollTop);
  }

  onNotifyOpened(view) {
    view.$el.attr('data-lenis-prevent', '');
    this.lenis.stop();
  }

  onNotifyClosed() {
    this.lenis.start();
  }
}

export default new LenisSmoothScrolling();
