'use strict';

// Abstracts away the requestAnimationFrame in an effort to provie a clock instance
// to sync various parts of an application
class Clock extends EventEmitter {

  constructor() {
    super();
    this.isRunning = true;

    this.tick = this.tick.bind(this);
    this.tick();

    window.onblur = () => {
      this.stop();
      console.info('Clock stopped');
    };

    window.onfocus = () => {
      this.start();
      console.info('Clock resumed');
    };
  }

  // Gets called on every requestAnimationFrame cycle
  tick() {
    if (this.isRunning) {
      this.emit('tick');
    }
    requestAnimationFrame(this.tick);
  }

  // Starts the clock
  start() {
    this.isRunning = true;
  }

  // Stops the clock
  stop() {
    this.isRunning = false;
  }

}

