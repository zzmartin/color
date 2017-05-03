// WebGL - 2D Image Swap Red and Blue
// from https://webglfundamentals.org/webgl/webgl-2d-image-red2blue.html

//  "use strict";
//Based on http://stackoverflow.com/a/3814285/2256700

var image;
var fileInput;
var degree;
var type;
var toggleF = false;
var toggleS;

/*function toggle(button) {
    console.log("hi");
}*/

window.onload = function init() {
    degree = document.getElementById("slider").value;

    document.getElementById("slider").onchange = function() {
        degree = document.getElementById("slider").value;
        render(image, type);

    }

    //https://github.com/MaPePeR/jsColorblindSimulator
    type = document.querySelector('input[name = "colorblindType"]:checked').value;
    image = new Image();

    fileInput = document.getElementById('fileInput');
    fileInput.onchange = function(evt) {
        //https://github.com/MaPePeR/jsColorblindSimulator
        var tgt = evt.target || window.event.srcElement
          , files = tgt.files;
        readFile(files);

        image.onload = function() {
            render(image, type);
        }
        console.log("hi2");
    }

    //https://github.com/MaPePeR/jsColorblindSimulator
    var radios = document.querySelectorAll('input[name = "colorblindType"]');
    for (var i = 0; i < radios.length; i++) {
        radios[i].onclick = function(evt) {
            type = document.querySelector('input[name = "colorblindType"]:checked').value;
            render(image, type);

        }
    }

    //http://stackoverflow.com/questions/3047755/i-am-trying-to-make-a-simple-toggle-button-in-javascript
    toggleS = document.getElementById('t');
    toggleS.onclick = function(evt) {
       
        if (document.getElementById("t").value == "Color deprive") {
            toggleF = true;
            console.log(toggleF);
            document.getElementById("t").value = "Color Matrix";
             render(image, type);
        }
        else if (document.getElementById("t").value == "Color Matrix") {
            toggleF = false;
            console.log(toggleF);
            document.getElementById("t").value = "Color deprive";
             render(image, type);
        }
    }

}

function readFile(files) {
    //https://github.com/MaPePeR/jsColorblindSimulator

    // FileReader support
    if (FileReader && files && files.length) {
        if (files.length !== 1) {
            alert("Can only show one file at a time");
            return;
        }
        if (!files[0].type.match('image.*')) {
            alert("Was not an image file. :(");
            return;
        }

        var fr = new FileReader();
        fr.onload = function() {
            var img = new Image();
            img.onload = function() {
                //createFilteredImage(this);
                image = this;

            }
            ;
            img.src = fr.result;
            image.src = img.src;

        }
        ;
        fr.readAsDataURL(files[0]);
    }// Not supported
    else {
        alert("Your Browser does not support the required Features.");
    }
}

function getColorMatrix(type) {
    if(toggleF) return getColorMatrix2(type);
    var malfunction = (100.0-degree)/100.0;
    console.log(malfunction);
    switch (type) {
    case "Normal":
        return [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
        break;
    case "Protanopia":
        return [malfunction, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
        break;
    case "Deuteranopia":
        return [1.0, 0.0, 0.0, 0.0, malfunction, 0.0, 0.0, 0.0, 1.0];
        break;
   case "Tritanopia":
        return [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, malfunction];
        break;
        
    }
}
function getColorMatrix2(type) {
    //from: https://github.com/MaPePeR/jsColorblindSimulator
    var malfunction = (100.0 - degree) / 100.0;
    console.log(malfunction);
    switch (type) {
    case "Normal":
        return [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
        break;
    case "Protanopia":
        return [56.667 / 100, 43.333 / 100, 0, 55.833 / 100, 44.167 / 100, 0, 0, 24.167 / 100, 75.833 / 100];
        break;
    case "Deuteranopia":
        return [62.5 / 100.0, 37.5 / 100.0, 0, 70 / 100.0, 30 / 100.0, 0, 0, 30 / 100.0, 70 / 100.0];
        break;
    case "Tritanopia":
        return [95.0 / 100.0, 5 / 100.0, 0.0, 0.0, 43.333 / 100, 56.667 / 100, 0.0, 47.5 / 100, 52.5 / 100.0];
        break;
    }
}
function render(image, type) {
    //based on https://webglfundamentals.org/webgl/lessons/webgl-image-processing.html

    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        return;
    }

    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, image.width, image.height);

    // provide texture coordinates for the rectangle.
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, ]), gl.STATIC_DRAW);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var colorMatrixLocation = gl.getUniformLocation(program, "u_colorMatrix");
    var colorMatrix = getColorMatrix(type);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;
    // 2 components per iteration
    var type = gl.FLOAT;
    // the data is 32bit floats
    var normalize = false;
    // don't normalize the data
    var stride = 0;
    // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;
    // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset)

    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;
    // 2 components per iteration
    var type = gl.FLOAT;
    // the data is 32bit floats
    var normalize = false;
    // don't normalize the data
    var stride = 0;
    // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;
    // start at the beginning of the buffer
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset)

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix3fv(colorMatrixLocation, false, colorMatrix);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

function setRectangle(gl, x, y, width, height) {
    //based on https://webglfundamentals.org/webgl/lessons/webgl-image-processing.html

    var max = Math.max(width / gl.canvas.width, height / gl.canvas.height);

    var x1 = x;
    var x2 = (x + width) / gl.canvas.width / max;
    var y1 = y;
    var y2 = (y + height) / gl.canvas.height / max;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2, ]), gl.STATIC_DRAW);
}


