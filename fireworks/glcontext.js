
(function() {
//============================================================================//
fireworks.get_shader_js = function(gl, name) {
    var source = fireworks.shaders[name]["data"];
    var type = fireworks.shaders[name]["type"];
    
    var shader;
    if (type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;  // Unknown shader type
    }
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
    
}

//============================================================================//
Camera = function(glcontext) {
    this.width = glcontext.viewport_width;
    this.height = glcontext.viewport_height;
    this.a = 0;
    this.dist = 25.;
    this.y = 2.0;
    this.angle_delta = 0.01;
    this.rotate();
    this.pos = $V([0,0,0]);
    this.cx = 0.;
    this.cy = 8.0;
    this.cz = 0.;
}

Camera.prototype.rotate = function() {
    this.pos = $V([this.dist*Math.cos((Math.PI/180) * this.a)+this.cx, this.y, this.dist*Math.sin((Math.PI/180) * this.a)+this.cz]);
    //this.pos = $V([1., this.y, this.dist*Math.sin((Math.PI/180) * this.a)]);
    //this.pos = $V([this.dist*Math.cos((Math.PI/180) * this.a), this.y, 0.]);
    this.a += this.angle_delta;
    if (this.a >= 360) {
        this.a = 0;
    }
}

Camera.prototype.perspective_matrix = function() {
    return makePerspective(45, this.width/this.height, 10, 50.);
    //return makeOrtho(-this.width/2, this.width/2, -this.height/2, this.height/2, -1., 1.);
}

Camera.prototype.translation_matrix = function() {
    this.rotate();
    var ex = this.pos.elements[0];
    var ey = this.pos.elements[1];
    var ez = this.pos.elements[2];
    var ux = 0.;
    var uy = 1.;
    var uz = 0.;
    return makeLookAt(ex,ey,ez, this.cx,this.cy,this.cz, ux,uy,uz);
    //return loadIdentity();
    //var mvMatrix = loadIdentity();
    //return mvTranslate(mvMatrix, this.pos.elements);
}

fireworks.Camera = Camera;

//============================================================================//

function GLContext(canvas) {
    this.viewport_width = 1;
    this.viewport_height = 1;
    this._initgl(canvas);
    this._confgl();
}

GLContext.prototype.set_viewport_size = function(w, h) {
    this.viewport_width = w;
    this.viewport_height = h;
    gl.viewport(0,0,w,h);
    //gl.viewportWidth = w;
    //gl.viewportHeight = h;
}

GLContext.prototype.reset = function() {
    this.set_viewport_size(this.viewport_width, this.viewport_height);
}

GLContext.prototype._initgl = function(canvas) {
    console.log("Initializing WebGL...");
    if (gl != null) {
        console.error("ERROR: 'gl' object already exists!");
    }
    try {
        gl = canvas.getContext("experimental-webgl");
        this.set_viewport_size(canvas.clientWidth, canvas.clientHeight);
    }
    catch(e) {
    }

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }
}

GLContext.prototype._confgl = function() {
    if (gl) {
        console.log("Configuring WebGL...");
        gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
        gl.clearDepth(1.0);                                     // Clear everything
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendColor(0.,0.,0.,0.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
        
        //initBuffers();
        
        //setInterval(drawScene, 15);
    }
}

fireworks.GLContext = GLContext;

//============================================================================//
})();




