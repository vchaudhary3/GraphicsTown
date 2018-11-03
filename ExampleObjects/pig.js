/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the pig is more complicated since it is designed to allow making many pigs

 we make a constructor function that will make instances of pigs - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all pigs - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each pig instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Pig = undefined;
var SpinningPig = undefined;
var m4 = twgl.m4;
// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all pigs - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;
    var buffers2 = undefined;

    // constructor for Pigs
    Pig = function Pig(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Pig.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all pigs
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["pig-vs", "pig-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,        -.5,-.5,-.5,  .5, .5,-.5, -.5, .5,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, .5, .5,        -.5,-.5, .5,  .5, .5, .5, -.5, .5, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
                    -.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5     // x = 1
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

            var arrays2 = {
                vpos : { numComponents: 3, data: [
                    //left Eye
                    -.8,1.0,0,    -.5,.7,0,   -.8,.7,0,
                    -.5,.7,0,   -.5,1.0,0,  -0.8,1.0,0,
                    //Right Eye
                    0.8,1.0,0,    .5,.7,0,   .8,.7,0,
                    .5,.7,0,   .5,1.0,0,  .8,1.0,0,
                    //Nose
                    -.3,.5,0,   .3,-.0,0,   -.3,-.0,0,
                    -.3,.5,0,   .3,.5,0,    .3,-.0,0,

                    -.3,.5,0.2,   .3,-.0,0.2,   -.3,-.0,0.2,
                    -.3,.5,0.2,   .3,.5,0.2,    .3,-.0,0.2


                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,

                ]}
            };
              buffers2 = twgl.createBufferInfoFromArrays(drawingState.gl,arrays2);
        }

    };
    var legPos = 0;
    var back = true;
    var walkPos = 1;
    var walkX = 0;
    var walkZ = 0;
    var squareInc = .1;
    Pig.prototype.draw = function(drawingState) {
        //Walking Logic
        if(walkPos == 1){
            walkX += squareInc;
            if(walkX >= 4.0){
                walkPos = 2;
            }
        }
        if(walkPos == 2){
            walkZ += squareInc;
            if(walkZ >= 4.0){
                walkPos = 3;
            }
        }
        if(walkPos == 3){
            walkX += -squareInc;
            if(walkX <= 0){
                walkPos = 4;
            }
        }
        if(walkPos == 4){
            walkZ += -squareInc;
            if(walkZ <= 0){
                walkPos = 1;
            }
        }


        // BODY
        //var theta = Number(drawingState.realtime)/200.0;
        var modelM = m4.scaling([2,1,1]);
        //twgl.m4.rotateY(modelM, theta, modelM);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        var modelRaise = m4.multiply(modelM, m4.translation([0 + walkX,1, 0 + walkZ]));

        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            pigcolor:[1, 0.894118, 0.882353], model: modelRaise });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);

        //HEAD
        var mode2M = m4.multiply(m4.scaling([.5,.8,.75]), modelRaise);
        var mvHead = m4.multiply(mode2M,m4.translation([1.5,0.55,0]));
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            pigcolor:[1,0.713725,0.756863], model: mvHead });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);

        //Face
        var modeF = m4.multiply(m4.scaling([.25,.5,.5]), mvHead);
        var rotF =  m4.multiply(m4.rotationY(Math.PI/2), modeF);
        var mvFace = m4.multiply(rotF,m4.translation([.55,-.2,0]));
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers2);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            pigcolor:[0,0,0], model: mvFace });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers2);


        //Leg Moving Logic
        if(back){
            legPos -=.1;
        }else{
            legPos+=.1;
        }

        if(legPos <= -.5){
            back = false;
        }

        if(legPos >= .1){
            back = true;
        }
        //Front Left Leg
        var modeFL = m4.multiply(m4.scaling([.15,1.0,.25]), modelRaise);
        var mov1 = m4.multiply(m4.translation([legPos,0,0]), modeFL);
        var mvFL = m4.multiply(mov1,m4.translation([.90,-0.5,-.60]));
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            pigcolor:[1,0.713725,0.756863], model: mvFL });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);

        //Front Right Leg
        var modeFR = m4.multiply(m4.scaling([.15,1.0,.25]), modelRaise);
        var mov2 = m4.multiply(m4.translation([legPos,0,0]), modeFR);
        var mvFR = m4.multiply(mov2,m4.translation([.90,-0.5,.60]));
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            pigcolor:[1,0.713725,0.756863], model: mvFR });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);

        //Back Left Leg
        var modeBL = m4.multiply(m4.scaling([.15,1.0,.25]), modelRaise);
        var mov3 = m4.multiply(m4.translation([-legPos,0,0]), modeBL);
        var mvBL = m4.multiply(mov3,m4.translation([-.90,-0.5,-.60]));
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            pigcolor:[1,0.713725,0.756863], model: mvBL });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);

        //Back Right Leg
        var modeBR = m4.multiply(m4.scaling([.15,1.0,.25]), modelRaise);
        var mov4 = m4.multiply(m4.translation([-legPos,0,0]), modeBL);
        var mvBR = m4.multiply(mov4,m4.translation([-.90,-0.5,.60]));
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            pigcolor:[1,0.713725,0.756863], model: mvBR });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);

    };
    Pig.prototype.center = function(drawingState) {
        return this.position;
    }

})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of pigs, just don't load this file.

grobjects.push(new Pig("Pig",[-2,0,0],1) );
