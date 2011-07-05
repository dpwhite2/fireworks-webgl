


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
    this.detonator = detonator || new TimedDetonator(fireworks.random_range(50,70)); // 50..70
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
    [0.75, 0.75, 1.00, 1]  // blue
];

Mortar.prototype.explode = function() {
    var ci = Math.floor(Math.random()*star_colors.length);
    var color = star_colors[ci].slice(0);
    var n = fireworks.config.firework_particle_count;
    var power = fireworks.random_range(3,4);
    var particles = [];
    for (var i=0; i<n; i++) {
        var r = Math.random()*power*2 + power;
        var pt = fireworks.random_on_sphere(Math.random()*power*2 + power);
        var vx = pt[0] + this.v[0];
        var vy = pt[1] + this.v[1];
        var vz = pt[2] + this.v[2];
        var pos = [this.pos[0], this.pos[1], this.pos[2]];
        var size = fireworks.random_range(2,4);
        var show_trails = size>3.3 ? true : false;
        var fric = 0.26;
        var fade = fireworks.random_range(0.970, 0.975);
        var size_fade = fireworks.random_range(0.985, 0.990);
        var ck = fireworks.random_range(0.9, 1.2); // randomize the initial color
        var c = [Math.min(color[0]*ck, 1.0), Math.min(color[1]*ck, 1.0), Math.min(color[2]*ck, 1.0), color[3]];
        particles.push(fireworks.create_particle(pos, [vx,vy,vz], c, size, fric, fade, size_fade, show_trails));
    }
    var pos = this.pos.slice(0);
    var vel = this.v.slice(0);
    var fade = 0.98;
    var fric = 0.26;
    var size = 5;
    var size_fade = 0.990;
    
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
    var ff = vd*vd*this.fric;
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
    if (this.age == 1) {
        this.size += 10.; // "flash"
    } else if (this.age < 12) {
        this.size -= 1.0; // fade after "flash"
    } else if (this.size < 0.7 && this.size > 0) {
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
    this.color = [0.25, 0.25, 0.2, 0.20];
    this.age = 0;
}

Exhaust.prototype.move = function() {
    this.pos[0] += this.v[0]*t;
    this.pos[1] += this.v[1]*t;
    this.pos[2] += this.v[2]*t;
    this.color[3] -= 0.01;
    if (this.age < 6) {
        this.size[3] *= 3.0;
    } else {
        this.size -= 0.05;
        this.color[3] -= 0.01;
    }
    this.age++;
};

fireworks.Exhaust = Exhaust;

//============================================================================//
fireworks.create_particle = function(pos, vel, color, size, fric, fade, size_fade, show_trails) {
    return new Particle(pos, vel, color, size, fric, fade, size_fade, show_trails);
};

function Particle(pos, vel, color, size, fric, fade, size_fade, show_trails) {
    this.pos = pos || [0,0,0];
    this.v =   vel || [0,0,0];
    this.color =    color || [1,1,1,1];
    this.size =     size || 5.;
    this.fric =     fric || 0.;
    this.fade =     fade || 0.98;
    this.size_fade = size_fade || 0.99;
    this.history = [];
    this.show_trails = show_trails || false;
    this.age = 0;
}

function sign(n) {
    return n < 0 ? -1 : 1;
}

Particle.prototype.calc_friction = function() {
    var vd = Math.sqrt(this.v[0]*this.v[0] + this.v[1]*this.v[1] + this.v[2]*this.v[2]);
    var uv = [this.v[0]/vd, this.v[1]/vd, this.v[2]/vd];
    var ff = vd*vd*this.fric;
    var fx = -uv[0] * ff; // x friction
    var fy = -uv[1] * ff; // y friction
    var fz = -uv[2] * ff; // z friction
    return [fx,fy,fz];
}

Particle.prototype.add_history = function() {
    if (this.show_trails) {
        if (this.history.length > fireworks.config.particle_history_size) {
            this.history.splice(0,1);
        }
        this.history.push(this.pos.slice(0));
    }
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
    // control color fading
    if (this.age > 20) {
        this.color[3] *= this.fade; // fade
    }
    // control size fading
    if (this.age == 1) {
        this.size += 10.; // "flash"
    } else if (this.age < 12) {
        this.size -= 1.0; // fade after "flash"
    } else if (this.size < 0.7 && this.size > 0) {
        this.size = Math.max(this.size - 0.1, 0);
    } else {
        this.size *= this.size_fade;
    }
    // control trails
    if (this.show_trails && this.size < 1.5) {
        if (this.history.length>1) {
            this.history.splice(0, Math.min(this.history.length-1, 2));
        } else {
            this.show_trails = false;
            this.history = [];
        }
    }
    this.add_history();
};

fireworks.Particle = Particle;

//============================================================================//
function Sim() {
    this.particles = [];
    this.exhausts = [];
    this.explosions = [];
    this.mortars = [];
    this.turn = 0;
}

Sim.prototype.add_particles = function(particles) {
    for (var i=0; i<particles.length; i++) {
        this.particles.push(particles[i]);
    }
};

Sim.prototype.add_exhausts = function(exhausts) {
    for (var i=0; i<exhausts.length; i++) {
        this.exhausts.push(exhausts[i]);
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
    remove(this.exhausts);
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
    for (var i=0; i<this.exhausts.length; i++) {
        var p = this.exhausts[i];
        if (p.color[3] < 0.05 || p.size < 0.01) {
            this.exhausts.splice(i, 1);
            i--;
        }
    }
};

Sim.prototype.remove_invisible_explosions = function() {
    for (var i=0; i<this.explosions.length; i++) {
        var e = this.explosions[i];
        if (e.color[3] < 0.10 || e.size < 0.05) {
            this.explosions.splice(i, 1);
            i--;
        }
    }
};

Sim.prototype.move_exhausts = function() {
    for (var i=0; i<this.exhausts.length; i++) {
        this.exhausts[i].move();
    }
};

Sim.prototype.move_mortars = function() {
    for (var i=0; i<this.mortars.length; i++) {
        var pp = this.mortars[i].move();
        this.add_exhausts(pp);
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
    this.move_exhausts();
    this.do_detonations();
    this.remove_invisible_particles();
    this.remove_invisible_explosions();
    this.remove_impacts();
};

fireworks.Sim = Sim;

//============================================================================//
})();

