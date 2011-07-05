/* 
requestAnimFrame taken from: 
    http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
            };
})();


(function() {
//============================================================================//
fireworks.start = function() {
    document.body.clientWidth
    
    var canvas = document.getElementById("glcanvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    
    app = new fireworks.App(canvas);
    if (gl) {
        requestAnimFrame(fireworks.do_turn, canvas);
    }
    fireworks.setup_event_handlers();
}

function random_neg() {
    return Math.random() - 0.5;
}

function random_exponential(lambda) {
    return -Math.log(Math.random()) / lambda;
}

fireworks.launch_mortars = function() {
    var min_vy = 14.0;
    var max_vy = 18.0;
    //var max_vx = 5;
    var max_x = 2;
    var max_launch_angle = 15; // angle from vertical, in degrees
    var n = 1;
    
    for (var i=0; i<n; i++) {
        var a = Math.random()*Math.PI*2;
        var d = Math.random()*max_x;
        var x = Math.cos(a)*d;
        var z = Math.sin(a)*d;
        var y = 0.;
        
        var r = fireworks.random_range(min_vy, max_vy);
        var pt = fireworks.random_in_cone(r, (Math.PI/180)*max_launch_angle);
        //var va = Math.random()*Math.PI*2;
        //var vd = Math.random()*max_vx;
        //var vx = Math.cos(va)*vd;
        //var vz = Math.sin(va)*vd;
        //var vy = fireworks.random_range(min_vy, max_vy);
        var vx = pt[0];
        var vy = pt[2]; // y and z swapped on purpose
        var vz = pt[1];
        
        var m = new fireworks.Mortar([x,y,z],[vx,vy,vz],[0.2,0.2,0.2,0.5],2);
        app.sim.add_mortar(m);
    }
}

var next_launch_turn = 60;

fireworks.launch_fireworks = function() {
    if (app.sim.turn == next_launch_turn) {
        fireworks.launch_mortars();
        next_launch_turn+= Math.floor(fireworks.random_range(30, 120));
    }
}

fireworks.do_turn = function() {
    app.do_turn();
    document.getElementById("fps-value").textContent = app.fps().toFixed(1);
    document.getElementById("angle-value").textContent = app.cam.a.toFixed(1);
    document.getElementById("x-value").textContent = app.cam.pos.elements[0].toFixed(2);
    document.getElementById("y-value").textContent = app.cam.pos.elements[1].toFixed(2);
    document.getElementById("z-value").textContent = app.cam.pos.elements[2].toFixed(2);
    document.getElementById("particles-count").textContent = app.sim.particles.length;
    document.getElementById("mortars-count").textContent = app.sim.mortars.length;
    document.getElementById("explosions-count").textContent = app.sim.explosions.length;

    fireworks.launch_fireworks();
    
    var canvas = document.getElementById("glcanvas");
    requestAnimFrame(fireworks.do_turn, canvas);
}

fireworks.setup_event_handlers = function() {

}

//============================================================================//
})();
