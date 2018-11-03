/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the fence is more complicated since it is designed to allow making many fences

 we make a constructor function that will make instances of fences - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all fences - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each fence instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Fence = undefined;
var SpinningFence = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all fences - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Fences
    Fence = function Fence(name, position, size, rotate, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
        this.rotate = rotate || false;
    }
    Fence.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all fences
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["fence-vs", "fence-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    //Front
                    0,0,0,  .3,1,0, 0,1,0,
                    0,0,0,  .3,0,0, .3,1,0,
                    0,1,0,  .15,1.2,0,  .3,1,0,
                    .3,.8,0,    .5,.8,0,    .3,.6,0,
                    .3,.6,0,    .5,.8,0,    .5,.6,0,
                    .3,.3,0,    .5,.3,0,    .3,.1,0,
                    .3,.1,0,    .5,.1,0,    .5,.3,0,
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,         0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,         
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Fence.prototype.draw = function(drawingState) {
        // we make a model matrix to place the fence in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        if(this.rotate == true){
                twgl.m4.rotateY(modelM, -Math.PI/2, modelM);
        }
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            fencecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Fence.prototype.center = function(drawingState) {
        return this.position;
    }

})();

//Back Left
grobjects.push(new Fence("fence1",[-8,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-7.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-7,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-6.5,0,-1.5],1) );
//Right door of Farm
grobjects.push(new Fence("fence1",[-3.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-3.0,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-2.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-2.0,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-1.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-1,0,-1.5],1) );
grobjects.push(new Fence("fence1",[-.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[0,0,-1.5],1) );
grobjects.push(new Fence("fence1",[.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[1.0,0,-1.5],1) );
grobjects.push(new Fence("fence1",[1.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[2.0,0,-1.5],1) );
grobjects.push(new Fence("fence1",[2.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[3,0,-1.5],1) );
grobjects.push(new Fence("fence1",[3.5,0,-1.5],1) );
grobjects.push(new Fence("fence1",[4,0,-1.5],1) );

//Closest to camera
grobjects.push(new Fence("fence1",[-8,0,5.5],1) );
grobjects.push(new Fence("fence1",[-7.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-7,0,5.5],1) );
grobjects.push(new Fence("fence1",[-6.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-6,0,5.5],1) );
grobjects.push(new Fence("fence1",[-5.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-4.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-4.0,0,5.5],1) );
grobjects.push(new Fence("fence1",[-3.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-3.0,0,5.5],1) );
grobjects.push(new Fence("fence1",[-2.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-2.0,0,5.5],1) );
grobjects.push(new Fence("fence1",[-1.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[-1,0,5.5],1) );
grobjects.push(new Fence("fence1",[-.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[0,0,5.5],1) );
grobjects.push(new Fence("fence1",[.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[1.0,0,5.5],1) );
grobjects.push(new Fence("fence1",[1.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[2.0,0,5.5],1) );
grobjects.push(new Fence("fence1",[2.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[3,0,5.5],1) );
grobjects.push(new Fence("fence1",[3.5,0,5.5],1) );
grobjects.push(new Fence("fence1",[4,0,5.5],1) );

//left
grobjects.push(new Fence("fence1",[-8,0,-1.5],1,true) );
grobjects.push(new Fence("fence1",[-8,0,-1.0],1,true) );
grobjects.push(new Fence("fence1",[-8,0,-.5],1,true) );
grobjects.push(new Fence("fence1",[-8,0,0],1,true) );
grobjects.push(new Fence("fence1",[-8,0,0.5],1,true) );
grobjects.push(new Fence("fence1",[-8,0,1.0],1,true) );
grobjects.push(new Fence("fence1",[-8,0,1.5],1,true) );
grobjects.push(new Fence("fence1",[-8,0,2.0],1,true) );
grobjects.push(new Fence("fence1",[-8,0,2.5],1,true) );
grobjects.push(new Fence("fence1",[-8,0,3.0],1,true) );
grobjects.push(new Fence("fence1",[-8,0,3.5],1,true) );
grobjects.push(new Fence("fence1",[-8,0,4.0],1,true) );
grobjects.push(new Fence("fence1",[-8,0,4.5],1,true) );
grobjects.push(new Fence("fence1",[-8,0,5.0],1,true) );

//Right
grobjects.push(new Fence("fence1",[4.5,0,-1.5],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,-1.0],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,-.5],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,0],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,0.5],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,1.0],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,1.5],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,2.0],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,2.5],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,3.0],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,3.5],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,4.0],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,4.5],1,true) );
grobjects.push(new Fence("fence1",[4.5,0,5.0],1,true) );
