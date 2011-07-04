fireworks.shaders = {
shader_fs_text: { type: "x-shader/x-fragment", data: "#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
\n\
varying vec4 vColor;\n\
\n\
void main(void) {\n\
    gl_FragColor = vColor;\n\
}" },
particles_shader_fs_text: { type: "x-shader/x-fragment", data: "#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
\n\
varying vec4 vColor;\n\
vec2 center = vec2(1., 1.);\n\
\n\
void main(void) {\n\
    //vec2 pt = vec2(2.*gl_PointCoord[0], 2.*gl_PointCoord[1]);\n\
    //float d = smoothstep(0., 0.4, 1.0 - distance(center, pt));\n\
    gl_FragColor = vColor;\n\
    //gl_FragColor[3] = d*gl_FragColor[3];\n\
}" },
particles_shader_vs_text: { type: "x-shader/x-vertex", data: "attribute vec3 particlePosition;\n\
attribute vec4 particleColor;\n\
attribute float particleSize;\n\
\n\
uniform mat4 uMVMatrix;\n\
uniform mat4 uPMatrix;\n\
varying vec4 vColor;\n\
\n\
void main(void) {\n\
    gl_PointSize = max(particleSize, 1.0);\n\
    gl_Position = uPMatrix * uMVMatrix * vec4(particlePosition, 1.0);\n\
    vColor = particleColor;\n\
}" },
shader_vs_text: { type: "x-shader/x-vertex", data: "attribute vec3 aStarPosition;\n\
attribute vec4 aStarColor;\n\
\n\
uniform mat4 uMVMatrix;\n\
uniform mat4 uPMatrix;\n\
varying vec4 vColor;\n\
\n\
void main(void) {\n\
    gl_Position = uPMatrix * uMVMatrix * vec4(aStarPosition, 1.0);\n\
    vColor = aStarColor;\n\
}" },
terrain_shader_fs_text: { type: "x-shader/x-fragment", data: "#ifdef GL_ES\n\
precision highp float;\n\
#endif\n\
\n\
varying vec4 vColor;\n\
varying vec3 light_weighting;\n\
\n\
void main(void) {\n\
    gl_FragColor = vec4(vColor.rgb * light_weighting, vColor.a);\n\
}" },
terrain_shader_vs_text: { type: "x-shader/x-vertex", data: "attribute vec3 position;\n\
attribute vec3 normal;\n\
attribute vec4 color;\n\
\n\
uniform mat4 uMVMatrix;\n\
uniform mat4 uPMatrix;\n\
\n\
uniform int n_lights;\n\
struct Light {\n\
    vec3 pos;\n\
    vec4 color;\n\
};\n\
uniform Light lights[8];\n\
\n\
//uniform vec3 light_pos;\n\
//uniform vec3 light_color;\n\
uniform vec3 ambient_color;\n\
\n\
varying vec4 vColor;\n\
varying vec3 light_weighting;\n\
\n\
void main(void) {\n\
    gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);\n\
    //vec4 mvpos = uMVMatrix * vec4(position, 1.0);\n\
    //gl_Position = uPMatrix * mvpos;\n\
    \n\
    //vec3 lightDirection = normalize(light_pos - position.xyz);\n\
    //vec3 transformedNormal = uNMatrix * normal;\n\
    vec3 transformedNormal = normal;\n\
    \n\
    //float pos_light_weight = max(dot(transformedNormal, lightDirection), 0.0);\n\
    //light_weighting = ambient_color + light_color * pos_light_weight;\n\
    \n\
    light_weighting = ambient_color;\n\
    for (int i=0; i<8; i++) {\n\
        if (i>=n_lights) break;\n\
        vec3 lightDirection = normalize(lights[i].pos - position.xyz);\n\
        float pos_light_weight = max(dot(transformedNormal, lightDirection), 0.0);\n\
        light_weighting += lights[i].color.rgb * pos_light_weight * lights[i].color.a *0.1;\n\
    }\n\
    \n\
    vColor = color;\n\
}" }
}
