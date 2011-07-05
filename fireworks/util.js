

fireworks.random_range = function(min, max) {
    return Math.random()*(max-min)+min;
}

fireworks.random_on_sphere = function(r) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2*Math.random() - 1);  // -1..1   cos(0)..cos(PI), cos(0)..cos(max_phi)
    //var r = Math.random()*power*2 + power;
    return [ r*Math.cos(theta)*Math.sin(phi),  // x
             r*Math.sin(theta)*Math.sin(phi),  // y
             r*Math.cos(phi)                   // z
           ]
}

fireworks.random_in_cone = function(r, max_phi) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(fireworks.random_range(Math.cos(max_phi), 1));
    return [ r*Math.cos(theta)*Math.sin(phi),  // x
             r*Math.sin(theta)*Math.sin(phi),  // y
             r*Math.cos(phi)                   // z
           ]
}

