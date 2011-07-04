
(function() {
//============================================================================//
function App(canvas) {
    this.glcontext = new fireworks.GLContext(canvas);
    
    this.plane_renderer = new fireworks.PlaneRenderer();
    this.axes_renderer = new fireworks.AxesRenderer();
    this.grid_renderer = new fireworks.GridRenderer();
    this.terrain_renderer = new fireworks.TerrainRenderer();
    
    this.mortar_renderer = new fireworks.MortarRenderer();
    this.particles_renderer = new fireworks.ParticlesRenderer();
    
    this.cam = new fireworks.Camera(this.glcontext);
    this.sim = new fireworks.Sim();
    this.times = [];
    this.last_fps = 0.;
    this._fps_turns = 50;  // calculate the frame rate after this many turns
}

App.prototype.reset_sim = function() {
    this.glcontext.reset();
    this.cam = new fireworks.Camera(this.glcontext);
    this.sim = new fireworks.Sim();
}

App.prototype.do_turn = function() {
    this.add_frametime();
    this.sim.do_turn();
    //this.sim.sort_particles(this.cam.pos.elements);
    this.render();
}

App.prototype.render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //this.plane_renderer.render(this.sim, this.cam);
    this.terrain_renderer.render(this.sim, this.cam);
    //this.grid_renderer.render(this.sim, this.cam);
    //this.axes_renderer.render(this.sim, this.cam);
    this.mortar_renderer.render(this.sim, this.cam);
    this.particles_renderer.render(this.sim, this.cam);
}

App.prototype.add_frametime = function() {
    this.times.push(Date.now());
    if (this.times.length > this._fps_turns) {
        this.times.shift();
    }
}

App.prototype.fps = function() {
    if (this.times.length >= this._fps_turns) {
        var secs = (this.times[this.times.length-1] - this.times[0]) / 1000.;
        this.last_fps = (this.times.length-1) / secs;
        this.times.splice(0, this._fps_turns/2);
    }
    return this.last_fps;
}

fireworks.App = App;

//============================================================================//
})();


