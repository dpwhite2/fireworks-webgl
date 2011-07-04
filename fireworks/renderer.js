
(function() {
//============================================================================//
function ShaderProgram(fragment_shader_name, vertex_shader_name) {
    this.vertex_shader = fireworks.get_shader_js(gl, vertex_shader_name);
    this.fragment_shader = fireworks.get_shader_js(gl, fragment_shader_name);
    
    // Create the shader program
    this.shaderprog = gl.createProgram();
    gl.attachShader(this.shaderprog, this.vertex_shader);
    gl.attachShader(this.shaderprog, this.fragment_shader);
    gl.linkProgram(this.shaderprog);
    
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(this.shaderprog, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
}

ShaderProgram.prototype.use = function() {
    gl.useProgram(this.shaderprog);
}

ShaderProgram.prototype.get_attrib_location = function(name) {
    return gl.getAttribLocation(this.shaderprog, name);
}

ShaderProgram.prototype.get_uniform_location = function(name) {
    return gl.getUniformLocation(this.shaderprog, name);
}

ShaderProgram.prototype.get = function(name) {
    return this.shaderprog;
}

//============================================================================//
function PlaneRenderer() {
    this.positions = [];
    this.colors = [];
    this._init_shaders();
    this._init_buffers();
}


PlaneRenderer.prototype._init_buffers = function() {
    this.pos_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pos_buffer);
    var a = 0.5;
    var b = 0.5;
    var c = 0.5;
    var axis_length = 2;
    this.positions = [
        -a,a,0,
        a,a,0,
        -a,-a,0,
        a,-a,0,
        
        -b,0,b,
        b,0,b,
        -b,0,-b,
        b,0,-b,
        
        0,-c,c,
        0,c,c,
        0,-c,-c,
        0,c,-c
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    this.color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    this.colors = [
        1,0,0,1,
        1,1,1,1,
        0.5,0,0,1,
        1,0,0,1,
        
        0,1,0,1,
        1,1,1,1,
        0,0.5,0,1,
        0,1,0,1,
        
        0,0,1,1,
        1,1,1,1,
        0,0,0.5,1,
        0,0,1,1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
}

PlaneRenderer.prototype._init_shaders = function() {
    this.shader_prog = new ShaderProgram("shader_fs_text", "shader_vs_text");
    this.shader_prog.use()
    this.pos_attr = this.shader_prog.get_attrib_location("aStarPosition");
    this.color_attr = this.shader_prog.get_attrib_location("aStarColor");
}

PlaneRenderer.prototype.render = function(sim, cam) {
    //gl.useProgram(this.shader_prog.get());
    this.shader_prog.use();
    gl.enableVertexAttribArray(this.pos_attr);
    gl.enableVertexAttribArray(this.color_attr);
    
    var perspective_matrix = cam.perspective_matrix();
    var mvMatrix = cam.translation_matrix();

    // draw planes
    for (var i=0; i<3; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
        gl.vertexAttribPointer(this.color_attr, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pos_buffer);
        gl.vertexAttribPointer(this.pos_attr, 3, gl.FLOAT, false, 0, 0);
        
        setMatrixUniforms(perspective_matrix, mvMatrix, this.shader_prog.get());
        gl.drawArrays(gl.TRIANGLE_STRIP, 4*i, 4);
    }
}

fireworks.PlaneRenderer = PlaneRenderer;


//============================================================================//
function AxesRenderer() {
    this.axis_length = 1.0;
    
    // shaders
    this.shader_prog = new ShaderProgram("shader_fs_text", "shader_vs_text");
    this.shader_prog.use()
    this.color_attr = this.shader_prog.get_attrib_location("aStarColor");
    this.pos_attr = this.shader_prog.get_attrib_location("aStarPosition");
    
    // data
    var y = 0.01; // show above the surface grid
    this.axes = [
        0,y,0,
        0,this.axis_length,0,
        
        0,y,0,
        this.axis_length,y,0,
        
        0,y,0,
        0,y,this.axis_length
    ];
    this.colors = [
        1,1,0,1,
        1,1,0,1,
        0,1,1,1,
        0,1,1,1,
        
        1,0,1,1,
        1,0,1,1
    ];
    
    // buffers
    this.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.axes), gl.STATIC_DRAW);
    
    this.color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
}

AxesRenderer.prototype.render = function(sim, cam) {
    //gl.useProgram(this.shader_prog.get());
    this.shader_prog.use();
    gl.enableVertexAttribArray(this.pos_attr);
    gl.enableVertexAttribArray(this.color_attr);
    
    var perspective_matrix = cam.perspective_matrix();
    var mvMatrix = cam.translation_matrix();
    // draw axes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.vertexAttribPointer(this.color_attr, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.vertexAttribPointer(this.pos_attr, 3, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms(perspective_matrix, mvMatrix, this.shader_prog.get());
    gl.drawArrays(gl.LINES, 0, 6);
}

fireworks.AxesRenderer = AxesRenderer;


//============================================================================//
function GridRenderer() {
    this.axis_length = 1.0;
    
    // shaders
    this.shader_prog = new ShaderProgram("shader_fs_text", "shader_vs_text");
    this.shader_prog.use()
    this.color_attr = this.shader_prog.get_attrib_location("aStarColor");
    this.pos_attr = this.shader_prog.get_attrib_location("aStarPosition");
    
    // data
    var x_lines = 6;
    var z_lines = 6;
    var spacing = 2;
    var x_min = -x_lines*spacing;
    var x_max = x_lines*spacing;
    var z_min = -z_lines*spacing;
    var z_max = z_lines*spacing;
    
    this.lines = [];
    for (var i=x_min; i<=x_max; i+=spacing) {
        this.lines.push(i, 0, z_min);
        this.lines.push(i, 0, z_max);
    }
    for (var i=z_min; i<=z_max; i+=spacing) {
        this.lines.push(x_min, 0, i);
        this.lines.push(x_max, 0, i);
    }
    var r = 0.1;
    var g = 0.1;
    var b = 0.1;
    this.colors = [];
    for (var i=0; i<this.lines.length/3; i++) {
        this.colors.push(r,g,b,1.0);
    }
    
    // buffers
    this.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.lines), gl.STATIC_DRAW);
    
    this.color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
}

GridRenderer.prototype.render = function(sim, cam) {
    //gl.useProgram(this.shader_prog.get());
    this.shader_prog.use();
    gl.enableVertexAttribArray(this.pos_attr);
    gl.enableVertexAttribArray(this.color_attr);
    
    var perspective_matrix = cam.perspective_matrix();
    var mvMatrix = cam.translation_matrix();
    // draw axes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.vertexAttribPointer(this.color_attr, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.vertexAttribPointer(this.pos_attr, 3, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms(perspective_matrix, mvMatrix, this.shader_prog.get());
    gl.drawArrays(gl.LINES, 0, this.lines.length/3);
}

fireworks.GridRenderer = GridRenderer;

//============================================================================//
function TerrainRenderer() {
    this.axis_length = 1.0;
    
    // shaders
    this.shader_prog = new ShaderProgram("terrain_shader_fs_text", "terrain_shader_vs_text");
    this.shader_prog.use()
    this.color_attr = this.shader_prog.get_attrib_location("color");
    this.pos_attr = this.shader_prog.get_attrib_location("position");
    this.normal_attr = this.shader_prog.get_attrib_location("normal");
    
    //this.lightpos_uni = this.shader_prog.get_uniform_location("light_pos");
    //this.lightcol_uni = this.shader_prog.get_uniform_location("light_color");
    //this.lights_uni = this.shader_prog.get_uniform_location("lights");
    this.lights_uni = [];
    for (var i=0; i<8; i++) {
        var posname = "lights[" + i + "].pos";
        var colorname = "lights[" + i + "].color";
        var obj = {pos: this.shader_prog.get_uniform_location(posname), 
                   color: this.shader_prog.get_uniform_location(colorname)};
        this.lights_uni.push(obj);
    }
    /*this.lights_uni = [
        {pos: this.shader_prog.get_uniform_location("lights[0].pos"), 
         color: this.shader_prog.get_uniform_location("lights[0].color")}
    ];*/
    this.n_lights_uni = this.shader_prog.get_uniform_location("n_lights");
    this.ambient_uni = this.shader_prog.get_uniform_location("ambient_color");
    
    // data
    var x_squares = 16; // squares on either side of z axis
    var z_squares = 16; // squares on either side of x axis
    var spacing = 2;  // size of a square
    var x_min = -x_squares*spacing;
    var x_max =  x_squares*spacing;
    var z_min = -z_squares*spacing;
    var z_max =  z_squares*spacing;
    
    this.columns = x_squares*2;
    this.rows = z_squares*2;
    
    var triangles = [];
    for (var x=x_min; x<x_max; x+=spacing) {
        triangles.push(x,0,z_min);
        triangles.push(x+spacing,0,z_min);
        for (var z=z_min; z<z_max; z+=spacing) {
            triangles.push(x,0,z+spacing);
            triangles.push(x+spacing,0,z+spacing);
        }
    }
    
    var r = 0.8;
    var g = 0.8;
    var b = 0.8;
    var colors = [];
    for (var i=0; i<triangles.length/3; i++) {
        colors.push(r,g,b,1.0);
    }
    var normals = [];
    for (var i=0; i<triangles.length/3; i++) {
        normals.push(0,1,0);
    }
    
    // buffers
    this.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles), gl.STATIC_DRAW);
    
    this.color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    this.normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
}

TerrainRenderer.prototype.update_terrain = function(sim, cam) {
    var n = Math.min(sim.explosions.length, 8);
    for (var i=0; i<n; i++) {
        var e = sim.explosions[i];
        gl.uniform3fv(this.lights_uni[i].pos, new Float32Array(e.pos));
        //var color = [e.color[0], e.color[1], e.color[2]];
        //gl.uniform3fv(this.lights_uni[i].color, new Float32Array(color));
        gl.uniform4fv(this.lights_uni[i].color, new Float32Array(e.color));
    }
    gl.uniform1i(this.n_lights_uni, n);
}

TerrainRenderer.prototype.render = function(sim, cam) {
    //gl.useProgram(this.shader_prog.get());
    this.shader_prog.use();
    gl.enableVertexAttribArray(this.pos_attr);
    gl.enableVertexAttribArray(this.color_attr);
    gl.enableVertexAttribArray(this.normal_attr);
    
    this.update_terrain(sim, cam);
    
    var perspective_matrix = cam.perspective_matrix();
    var mvMatrix = cam.translation_matrix();
    // draw axes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.vertexAttribPointer(this.color_attr, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.vertexAttribPointer(this.pos_attr, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
    gl.vertexAttribPointer(this.normal_attr, 3, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms(perspective_matrix, mvMatrix, this.shader_prog.get());
    //var ambient = [0.1,0.1,0.1];
    var ambient = [0,0,0];
    gl.uniform3fv(this.ambient_uni, new Float32Array(ambient));
    /*gl.uniform1i(this.n_lights_uni, 1);
    //var lights = [0,10,0,   0.9,0.2,0.2]
    gl.uniform3fv(this.lights_uni[0].pos, new Float32Array([0,10,0]));
    gl.uniform3fv(this.lights_uni[0].color, new Float32Array([0.9,0.2,0.2]));*/
    /*var lightpos = [0,10,0];
    gl.uniform3fv(this.lightpos_uni, new Float32Array(lightpos));
    var lightcol = [0.9,0.2,0.2];
    gl.uniform3fv(this.lightcol_uni, new Float32Array(lightcol));*/
    
    for (var i=0; i<this.columns; i++) {
        gl.drawArrays(gl.TRIANGLE_STRIP, i*(this.rows*2+2), this.rows*2+2);
    }
}

fireworks.TerrainRenderer = TerrainRenderer;

//============================================================================//
function ParticlesRenderer() {
    // shaders
    this.shader_prog = new ShaderProgram("particles_shader_fs_text", "particles_shader_vs_text");
    this.shader_prog.use()
    this.color_attr = this.shader_prog.get_attrib_location("particleColor");
    this.pos_attr = this.shader_prog.get_attrib_location("particlePosition");
    this.size_attr = this.shader_prog.get_attrib_location("particleSize");
    
    // buffers
    this.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    
    this.color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    
    this.size_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.size_buffer);
}

//var flag = false;

ParticlesRenderer.prototype.update_particles = function(sim, cam) {
    var points = [];
    var colors = [];
    var sizes = [];
    
    for (var i = 0; i < sim.particles.length; i++) {
        p = sim.particles[i];
        points.push(p.pos[0], p.pos[1], p.pos[2]);
        //var a = Math.min(Math.max((p.v[1]+20)/30, 0.5), 1.0); // alpha is based on vertical speed
        //var a = Math.min(Math.max((p.v[1])/40, 0.3), 1.0); // alpha is based on vertical speed
        //var k = (Math.max(p.v[1]-10, 0.))/6;
        //var rk = Math.random()*0.3 + 0.7;
        //var gk = Math.random()*0.3 + 0.7;
        colors.push(p.color[0], p.color[1], p.color[2], p.color[3]);
        sizes.push(p.size);
    }
    
    /*if (!flag && points.length > 0) {
        flag = true;
        console.log(points);
    }*/
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.size_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
}

ParticlesRenderer.prototype.render = function(sim, cam) {
    //gl.useProgram(this.shader_prog.get());
    this.shader_prog.use();
    gl.enableVertexAttribArray(this.pos_attr);
    gl.enableVertexAttribArray(this.color_attr);
    gl.enableVertexAttribArray(this.size_attr);
    
    this.update_particles(sim, cam);
    
    var perspective_matrix = cam.perspective_matrix();
    var mvMatrix = cam.translation_matrix();
    
    // draw axes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.vertexAttribPointer(this.color_attr, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.vertexAttribPointer(this.pos_attr, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.size_buffer);
    gl.vertexAttribPointer(this.size_attr, 1, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms(perspective_matrix, mvMatrix, this.shader_prog.get());
    gl.drawArrays(gl.POINTS, 0, sim.particles.length);
}

fireworks.ParticlesRenderer = ParticlesRenderer;

//============================================================================//
function MortarRenderer() {
    // shaders
    this.shader_prog = new ShaderProgram("particles_shader_fs_text", "particles_shader_vs_text");
    this.shader_prog.use()
    this.color_attr = this.shader_prog.get_attrib_location("particleColor");
    this.pos_attr = this.shader_prog.get_attrib_location("particlePosition");
    this.size_attr = this.shader_prog.get_attrib_location("particleSize");
    
    // buffers
    this.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    
    this.color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    
    this.size_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.size_buffer);
}

MortarRenderer.prototype.update_mortars = function(sim, cam) {
    var points = [];
    var colors = [];
    var sizes = [];
    
    for (var i = 0; i < sim.mortars.length; i++) {
        p = sim.mortars[i];
        points.push(p.pos[0], p.pos[1], p.pos[2]);
        //var a = Math.min(Math.max((p.v[1]+20)/30, 0.5), 1.0); // alpha is based on vertical speed
        //var a = Math.min(Math.max((p.v[1])/40, 0.3), 1.0); // alpha is based on vertical speed
        //var k = (Math.max(p.v[1]-10, 0.))/6;
        colors.push(p.color[0], p.color[1], p.color[2], p.color[3]);
        sizes.push(p.size);
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.size_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
}

MortarRenderer.prototype.render = function(sim, cam) {
    //gl.useProgram(this.shader_prog.get());
    this.shader_prog.use();
    gl.enableVertexAttribArray(this.pos_attr);
    gl.enableVertexAttribArray(this.color_attr);
    gl.enableVertexAttribArray(this.size_attr);
    
    this.update_mortars(sim, cam);
    
    var perspective_matrix = cam.perspective_matrix();
    var mvMatrix = cam.translation_matrix();
    
    // draw axes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
    gl.vertexAttribPointer(this.color_attr, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
    gl.vertexAttribPointer(this.pos_attr, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.size_buffer);
    gl.vertexAttribPointer(this.size_attr, 1, gl.FLOAT, false, 0, 0);
    
    setMatrixUniforms(perspective_matrix, mvMatrix, this.shader_prog.get());
    gl.drawArrays(gl.POINTS, 0, sim.mortars.length);
}

fireworks.MortarRenderer = MortarRenderer;

//============================================================================//
})();
