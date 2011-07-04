


(function() {

//============================================================================//
var g = -9.81;
var t = 1/60;
var t2 = t * t;

//============================================================================//
function AltitudeDetonator(altitude) {
    this.altitude = altitude;
}

AltitudeDetonator.prototype.is_due = function(obj) {
    return obj.pos[1] >= this.altitude;
};

fireworks.AltitudeDetonator = AltitudeDetonator;

function TimedDetonator(time) {
    this.time = time;
}

TimedDetonator.prototype.is_due = function(obj) {
    return obj.age >= this.time;
};

fireworks.TimedDetonator = TimedDetonator;

//============================================================================//
function Mortar(pos, v, color, size, detonator) {
    this.pos = pos || [0,0,0];
    this.v = v || [0,0,0];
    this.color = color || [1,1,1,1];
    this.size = size || 1;
    this.detonator = detonator || new TimedDetonator(Math.random()*20 + 50); // 50..70
    this.age = 0;
};

Mortar.prototype.move = function() {
    this.pos[0] = this.v[0]*t + this.pos[0]; // x
    this.pos[1] = 0.5*g*t2 + this.v[1]*t + this.pos[1]; // y
    this.pos[2] = this.v[2]*t + this.pos[2]; // z
    // velocity in x and z directions is constant
    this.v[1] = g*t + this.v[1]; // y
    this.age++;
    return [new Exhaust([this.pos[0], this.pos[1], this.pos[2]], [0,0,0], this.size)];
};

Mortar.prototype.is_due = function() {
    return this.detonator.is_due(this);
};

var star_colors = [
    [1.00, 1.00, 0.80, 1], // "white"
    [1.00, 1.00, 0.65, 1], // yellow
    [0.70, 1.00, 1.00, 1], // teal
    [1.00, 0.70, 1.00, 1], // magenta
    
    [1.00, 0.60, 0.60, 1], // red
    [0.60, 1.00, 0.60, 1], // green
    [0.75, 0.75, 1.00, 1] // blue
];

Mortar.prototype.explode = function() {
    var ci = Math.floor(Math.random()*star_colors.length);
    var color = star_colors[ci].slice(0);
    var n = 800;
    var power = Math.random() + 3; // 3..4
    var particles = [];
    for (var i=0; i<n; i++) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2*Math.random() - 1);
        var r = Math.random()*power*2 + power;
        var vx = r*Math.cos(theta)*Math.sin(phi) + this.v[0];
        var vy = r*Math.sin(theta)*Math.sin(phi) + this.v[1];
        var vz = r*Math.cos(phi) + this.v[2];
        var pos = [this.pos[0], this.pos[1], this.pos[2]];
        var size = Math.random()*4 + 2;  // 2..6
        var fric = 0.26;
        var fade = Math.random()*0.005 + 0.97;
        //var fade = 0.99;
        //var size_fade = 0.98;
        var size_fade = Math.random()*0.005 + 0.985;
        var ck = Math.random()*0.3 + 0.9;
        var c = [Math.min(color[0]*ck, 1.0), Math.min(color[1]*ck, 1.0), Math.min(color[2]*ck, 1.0), color[3]];
        particles.push(fireworks.create_particle(pos, [vx,vy,vz], c, size, fric, fade, size_fade));
    }
    //console.debug(particles);
    //console.pause();
    var pos = this.pos.slice(0);
    var vel = this.v.slice(0);
    var fade = 0.97;
    var fric = 0.26;
    var size = 5;
    var size_fade = 0.985;
    
    var explosion = new Explosion(pos, vel, color, size, fric, fade, size_fade);
    return {particles: particles,
            explosion: explosion};  // return list of particles
};

fireworks.Mortar = Mortar;

function Explosion(pos, vel, color, size, fric, fade, size_fade) {
    this.pos = pos;
    this.v = vel;
    this.color = color;
    this.fade = fade;
    this.fric = fric;
    this.size = size;
    this.size_fade = size_fade;
}

Explosion.prototype.calc_friction = function() {
    var vd = Math.sqrt(this.v[0]*this.v[0] + this.v[1]*this.v[1] + this.v[2]*this.v[2]);
    var uv = [this.v[0]/vd, this.v[1]/vd, this.v[2]/vd];
    var ff = vd*vd*p.fric;
    var div = 1;
    var fx = -uv[0] * ff * div; // x friction
    var fy = -uv[1] * ff * div; // y friction
    var fz = -uv[2] * ff * div; // z friction
    return [fx,fy,fz];
}

Explosion.prototype.move = function() {
    this.age++;
    var fric = this.calc_friction();
    var fx = fric[0];
    var fy = fric[1];
    var fz = fric[2];
    this.pos[0] = 0.5*fx*t2 + this.v[0]*t + this.pos[0]; // x
    this.pos[1] = 0.5*fy*t2 + 0.5*g*t2 + this.v[1]*t + this.pos[1]; // y
    this.pos[2] = 0.5*fz*t2 + this.v[2]*t + this.pos[2]; // z
    
    this.v[1] = fy*t + g*t + this.v[1]; // y
    this.v[0] = fx*t + this.v[0]; // x
    this.v[2] = fz*t + this.v[2]; // z
    if (this.age > 20) {
        this.color[3] *= this.fade; // fade
    }
    if (this.size < 0.7 && this.size > 0) {
        this.size = Math.max(this.size - 0.1, 0);
    } else {
        this.size *= this.size_fade;
    }
}

fireworks.Explosion = Explosion;

function Exhaust(pos, vel, size) {
    this.pos = pos;
    this.v = vel;
    this.size = size*2;
    this.color = [0.4, 0.4, 0.4, 0.5];
    this.age = 0;
}

Exhaust.prototype.move = function() {
    this.pos[0] += this.v[0]*t;
    this.pos[1] += this.v[1]*t;
    this.pos[2] += this.v[2]*t;
    this.color[3] -= 0.01;
    // if (this.age < 3) {
        // this.color[3] -= 0.1
    // } else if (this.age == 3) {
        // this.color = [0.6, 0.6, 0.6, 1.0];
    // } else {
        // this.color[3] -= 0.04;
    // }
    this.size -= 0.05;
    this.age++;
};

fireworks.Exhaust = Exhaust;

//============================================================================//
fireworks.create_particle = function(pos, vel, color, size, fric, fade, size_fade) {
    return new Particle(pos, vel, color, size, fric, fade, size_fade);
};

function Particle(pos, vel, color, size, fric, fade, size_fade) {
    this.pos = pos || [0,0,0];
    this.v =   vel || [0,0,0];
    this.color =    color || [1,1,1,1];
    this.size =     size || 5.;
    this.fric =     fric || 0.;
    this.fade =     fade || 0.98;
    this.size_fade = size_fade || 0.99;
    this.age = 0;
}

function sign(n) {
    return n < 0 ? -1 : 1;
}

Particle.prototype.calc_friction = function() {
    var vd = Math.sqrt(this.v[0]*this.v[0] + this.v[1]*this.v[1] + this.v[2]*this.v[2]);
    var uv = [this.v[0]/vd, this.v[1]/vd, this.v[2]/vd];
    var ff = vd*vd*p.fric;
    /*if (vd < 5.0) {
        return [0,0,0];
    }*/
    //var div = Math.max(this.size, 4) / 4;
    var div = 1;
    var fx = -uv[0] * ff * div; // x friction
    var fy = -uv[1] * ff * div; // y friction
    var fz = -uv[2] * ff * div; // z friction
    return [fx,fy,fz];
}

Particle.prototype.move = function() {
    //console.log(p);
    this.age++;
    var fric = this.calc_friction();
    var fx = fric[0];
    var fy = fric[1];
    var fz = fric[2];
    this.pos[0] = 0.5*fx*t2 + this.v[0]*t + this.pos[0]; // x
    this.pos[1] = 0.5*fy*t2 + 0.5*g*t2 + this.v[1]*t + this.pos[1]; // y
    this.pos[2] = 0.5*fz*t2 + this.v[2]*t + this.pos[2]; // z
    // velocity in x and z directions is constant
    this.v[1] = fy*t + g*t + this.v[1]; // y
    this.v[0] = fx*t + this.v[0]; // x
    this.v[2] = fz*t + this.v[2]; // z
    if (this.age > 20) {
        this.color[3] *= this.fade; // fade
    }
    if (this.size < 0.7 && this.size > 0) {
        this.size = Math.max(this.size - 0.1, 0);
    } else {
        this.size *= this.size_fade;
    }
};

fireworks.Particle = Particle;

//============================================================================//
function Sim() {
    this.particles = [];
    this.splashes = [];
    this.explosions = [];
    this.mortars = [];
    this.turn = 0;
}

Sim.prototype.add_particles = function(particles) {
    //console.log(particles);
    for (var i=0; i<particles.length; i++) {
        this.particles.push(particles[i]);
    }
};

Sim.prototype.add_mortar = function(m) {
    this.mortars.push(m);
};

Sim.prototype.add_explosion = function(e) {
    this.explosions.push(e);
};

Sim.prototype.remove_particle = function(index) {
    this.particles.splice(index, 1);
};

// sort from farthest to nearest
Sim.prototype.sort_particles = function(eye) {
    for (var i=0; i<this.particles.length; i++) {
        var p = this.particles[0];
        var dx = p.pos[0] - eye[0];
        var dy = p.pos[1] - eye[1];
        var dz = p.pos[2] - eye[2];
        p.dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
    function cmp(p1, p2) {
        if (p1.dist > p2.dist) {
            return -1;
        } else if (p1.dist < p2.dist) {
            return 1;
        } else {
            return 0;
        }
    }
    this.particles.sort(cmp);
};

// remove particles that have impacted the ground
Sim.prototype.remove_impacts = function() {
    function remove(seq) {
        for (var i=0; i<seq.length; i++) {
            var p = seq[i];
            if (p.pos[1] < 0 && p.v[1] <= 0) {
                seq.splice(i, 1);
                i--;
            }
        }
    }
    remove(this.particles);
    remove(this.mortars);
    remove(this.explosions);
};

Sim.prototype.do_detonations = function() {
    for (var i=0; i<this.mortars.length; i++) {
        var p = this.mortars[i];
        if (p.is_due()) {
            var explosion = p.explode();
            this.add_particles(explosion.particles);
            this.add_explosion(explosion.explosion);
            this.mortars.splice(i, 1);
            i--;
        }
    }
};

Sim.prototype.remove_invisible_particles = function() {
    for (var i=0; i<this.particles.length; i++) {
        var p = this.particles[i];
        if (p.color[3] < 0.15 || p.size < 0.1) {
            this.particles.splice(i, 1);
            i--;
        }
    }
};

Sim.prototype.remove_invisible_explosions = function() {
    for (var i=0; i<this.explosions.length; i++) {
        var e = this.explosions[i];
        if (e.color[3] < 0.15 || e.size < 0.1) {
            this.explosions.splice(i, 1);
            i--;
        }
    }
};

Sim.prototype.update_splashes = function() {
    for (var i=0; i<this.splashes.length; i++) {
        var p = this.splashes[i];
        if (p.color[3] < 0.05) {
            this.splashes.splice(i, 1);
            i--;
        } else {
            p.color[3] *= 0.90;
        }
    }
};

Sim.prototype.move_mortars = function() {
    for (var i=0; i<this.mortars.length; i++) {
        var pp = this.mortars[i].move();
        //this.add_particles(pp);
    }
};

Sim.prototype.move_explosions = function() {
    for (var i=0; i<this.explosions.length; i++) {
        this.explosions[i].move();
    }
};

Sim.prototype.move_particles = function() {
    for (var i=0; i<this.particles.length; i++) {
        this.particles[i].move();
    }
};

Sim.prototype.do_turn = function() {
    this.turn++;
    this.move_particles();
    this.move_explosions();
    this.move_mortars();
    this.do_detonations();
    this.remove_invisible_particles();
    this.remove_invisible_explosions();
    this.remove_impacts();
};

fireworks.Sim = Sim;

//============================================================================//
})();

