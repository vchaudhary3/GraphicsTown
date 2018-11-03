/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the farm is more complicated since it is designed to allow making many farms

 we make a constructor function that will make instances of farms - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all farms - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each farm instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Farm = undefined;
var SpinningFarm = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all farms - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Farms
    Farm = function Farm(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Farm.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all farms
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["farm-vs", "farm-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                //Front Face
                0,0,0,      .5,0,0,      0,.5,0,
                0,.5,0,     .5,.5,0,    .5,0,0,
                .5,0,0,     1,0,0,      1,.5,0,
                .5,0,0,     .5,.5,0,    1,.5,0,

                0,0,0,      -.5,0,0,      0,.5,0,
                0,.5,0,     -.5,.5,0,    -.5,0,0,
                -.5,0,0,     -1,0,0,     -1,.5,0,
                -.5,0,0,     -.5,.5,0,   -1,.5,0,

                //Upper half
                1,.5,0,     .5,.5,0,     .8,1.25,0,
                -1,.5,0,    -.5,.5,0,    -.8,1.25,0,
                .5,.5,0,    .8,1.25,0,    -.5,.5,0,
                -.5,.5,0,   -.8,1.25,0,   .8,1.25,0,
                -.8,1.25,0,  0,1.5,0,       .8,1.25,0,


                //Back Face
                0,0,-1.0,      .5,0,-1.0,      0,.5,-1.0,
                0,.5,-1.0,     .5,.5,-1.0,    .5,0,-1.0,
                .5,0,-1.0,     1,0,-1.0,      1,.5,-1.0,
                .5,0,-1.0,     .5,.5,-1.0,    1,.5,-1.0,

                0,0,-1.0,      -.5,0,-1.0,      0,.5,-1.0,
                0,.5,-1.0,     -.5,.5,-1.0,    -.5,0,-1.0,
                -.5,0,-1.0,     -1,0,-1.0,     -1,.5,-1.0,
                -.5,0,-1.0,     -.5,.5,-1.0,   -1,.5,-1.0,

                //Upper half
                1,.5,-1.0,     .5,.5,-1.0,     .8,1.25,-1.0,
                -1,.5,-1.0,    -.5,.5,-1.0,    -.8,1.25,-1.0,
                .5,.5,-1.0,    .8,1.25,-1.0,    -.5,.5,-1.0,
                -.5,.5,-1.0,   -.8,1.25,-1.0,   .8,1.25,-1.0,
                -.8,1.25,-1.0,  0,1.5,-1.0,       .8,1.25,-1.0,

                //Right Face
                1,0,0,  1,.5,0, 1,0,-1,
                1,.5,0, 1,0,-1, 1,.5,-1,

                1,.5,0, .8,1.25,0,  1,.5,-1,
                .8,1.25,-1, 1,.5,-1,    .8,1.25,0,

                0,1.5,0,    0,1.5,-1,   .8,1.25,-1,
                .8,1.25,-1, .8,1.25,0,  0,1.5,0,

                //Left Face
                -1,0,0,  -1,.5,0, -1,0,-1,
                -1,.5,0, -1,0,-1, -1,.5,-1,

                -1,.5,0, -.8,1.25,0,  -1,.5,-1,
                -.8,1.25,-1, -1,.5,-1,    -.8,1.25,0,

                -0,1.5,0,    -0,1.5,-1,   -.8,1.25,-1,
                -.8,1.25,-1, -.8,1.25,0,  -0,1.5,0,




                ] },
                vnormal : {numComponents:3, data: [
                    //Front Face
                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,

                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,
                    //Upper  Half
                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,

                    //Back Face
                    0,0,-1, 0,0,-1, 0,0,-1,         0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,-1, 0,0,-1, 0,0,-1,         0,0,-1, 0,0,-1, 0,0,-1,

                    0,0,-1, 0,0,-1, 0,0,-1,         0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,-1, 0,0,-1, 0,0,-1,         0,0,-1, 0,0,-1, 0,0,-1,
                    //Upper  Half
                    0,0,-1, 0,0,-1, 0,0,-1,         0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,-1, 0,0,-1, 0,0,-1,         0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,-1, 0,0,-1, 0,0,-1,

                    //Right Face
                    1,0,0, 1,0,0, 1,0,0,            1,0,0, 1,0,-0, 1,0,-0,

                    1,.5,0, 1,.5,0, 1,.5,0,            1,.5,0, 1,.5,-0, 1,.5,-0,

                    1,1,0, 1,1,0, 1,1,0,            1,1,0, 1,1,-0, 1,1,-0,

                    //Left Face
                    -1,0,0, -1,0,0, -1,0,0,            -1,0,0, -1,0,-0, -1,0,-0,

                    -1,.5,0, -1,.5,0, -1,.5,0,            -1,.5,0, -1,.5,-0, -1,.5,-0,

                    -1,1,0, -1,1,0, -1,1,0,            -1,1,0, -1,1,-0, -1,1,-0,
                ]},

                vcolor : {numComponents:3, data: [
                    //Front Face
                    0.698039, 0.133333, 0.133333, 0.545098, 0, 0,  0.647059, 0.164706, 0.164706,         0,0,0, 0,0,0, 0,0,0,
                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,        0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                    0.698039, 0.133333, 0.133333, 0.545098, 0, 0,  0.647059, 0.164706, 0.164706,         0,0,0, 0,0,0, 0,0,0,
                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,        0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,
                    //Upper  Half
                    0.545098, 0, 0, 0.698039, 0.133333, 0.133333, 0.545098, 0, 0,        0.545098, 0, 0, 0.698039, 0.133333, 0.133333, 0.545098, 0, 0,
                    1,0,0, 1,0,0, 1,0,0,         1,0,0, 1,0,0, 1,0,0,
                    0.545098, 0, 0, 0.698039, 0.133333, 0.133333, 0.545098, 0, 0,


                    //Back Face
                    0.698039, 0.133333, 0.133333, 0.545098, 0, 0,  0.647059, 0.164706, 0.164706,         0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,        0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                    0.698039, 0.133333, 0.133333, 0.545098, 0, 0,  0.647059, 0.164706, 0.164706,         0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,        0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,
                    //Upper  Half
                    0.545098, 0, 0, 0.698039, 0.133333, 0.133333, 0.545098, 0, 0,        0.545098, 0, 0, 0.698039, 0.133333, 0.133333, 0.545098, 0, 0,
                    1,0,0, 1,0,0, 1,0,0,         1,0,0, 1,0,0, 1,0,0,
                    0.545098, 0, 0, 0.698039, 0.133333, 0.133333, 0.545098, 0, 0,

                    //Right Face
                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                    //Left Face
                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,    0.545098, 0, 0, 0.545098, 0, 0,  0.545098, 0, 0,

                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Farm.prototype.draw = function(drawingState) {
        // we make a model matrix to place the farm in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            farmcolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Farm.prototype.center = function(drawingState) {
        return this.position;
    }


    ////////
    // constructor for Farms
    SpinningFarm = function SpinningFarm(name, position, size, color, axis) {
        Farm.apply(this,arguments);
        this.axis = axis || 'X';
    }
    SpinningFarm.prototype = Object.create(Farm.prototype);
    SpinningFarm.prototype.draw = function(drawingState) {
        // we make a model matrix to place the farm in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/200.0;
        if (this.axis == 'X') {
            twgl.m4.rotateX(modelM, theta, modelM);
        } else if (this.axis == 'Z') {
            twgl.m4.rotateZ(modelM, theta, modelM);
        } else {
            twgl.m4.rotateY(modelM, theta, modelM);
        }
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            farmcolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningFarm.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of farms, just don't load this file.
grobjects.push(new Farm("barn1",[-5,0.0,-2],3) );
