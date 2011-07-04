function loadIdentity() {
  return Matrix.I(4);
}

function multMatrix(mvMatrix, m) {
  return mvMatrix.x(m);
}

function mvTranslate(mvMatrix, v) {
  return multMatrix(mvMatrix, Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms(perspectiveMatrix, mvMatrix, shaderProgram) {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}
