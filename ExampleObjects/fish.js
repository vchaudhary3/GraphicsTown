/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the tree is more complicated since it is designed to allow making many trees

 we make a constructor function that will make instances of trees - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all trees - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each tree instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Tree = undefined;
var t = 0;



// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all trees - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Trees
    Tree = function Tree(name, position, size, rot, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
        this.rot = rot || Math.PI;
    }
    Tree.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all trees
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["fish-vs", "fish-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -1.8,1,0,   -1.2,0,0,   -1.8,-1,0,
                    -1.2,0,0,   -1,1,0,     -1,-1,0,
                    -1,1,0,     -1,-1,0,    -.5,0,0,
                    -1,1,0,     0,1,0,      -.5,0,0,
                    -1,-1,0,    -.5,0,0,    0,-1,0,
                    -.5,0,0,    0,1,0,      .5,0,0,
                    -.5,0,0,    .5,0,0,     0,-1,0,
                    0,1,0,      1,1,0,      .5,0,0,
                    0,-1,0,     .5,0,0,     1,-1,0,
                    .5,0,0,     1,1,0,      1,-1,0,
                    1,1,0,      2,0,0,      1,-1,0,
                    .8,-1,0,    .8,-1.7,0,  .3,-1,0,
                    -.8,1,0,    -.6,1.5,0,    0,1,0,
                    -.6,1.5,0,    .6,1.5,0,     0,1,0,
                    0,1,0,      .6,1.5,0,     .8,1,0,
                    //Eye
                    1.0,0,.1,    1.6,0,.1,       1.2,.5,.1,
                    1.0,0,-.1,    1.6,0,-.1,       1.2,.5,-.1,


                ] },
                vnormal : {numComponents:3, data: [
                	 0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    0,0,1, 0,0,1, 0,0,1,
                    1.2,0,0,    1.8,0,0,       1.6,.5,0,
                    1.2,0,0,    1.8,0,0,       1.6,.5,0,
                ]},

                vcolor : {numComponents:3, data: [
                    0.498039, 1, 0.831373,   -1.2,0,0,  0, 0.545098, 0.545098,
                    0, 0.545098, 0.545098,   -1,1,0,     -1,-1,0,
                    -1,1,0,     0.498039, 1, 0.831373,   0, 0.545098, 0.545098,
                    0.498039, 1, 0.831373,     0,1,0,      -.5,0,0,
                    0, 0.545098, 0.545098,    -.5,0,0,    0,-1,0,
                    0.498039, 1, 0.831373,   0, 0.74902, 1,       .5,0,0,
                    0, 0.545098, 0.545098,    0, 0.74902, 1,      0.498039, 1, 0.831373,
                    0.498039, 1, 0.831373,     0.498039, 1, 0.831373,      0, 0.545098, 0.545098,
                     0, 0.74902, 1,    0, 0.74902, 1,      1,-1,0,
                    .5,0,0,     0.498039, 1, 0.831373,      1,-1,0,
                    1,1,0,     0.498039, 1, 0.831373,      1,-1,0,
                    .8,-1,0,    .8,-1.3,0,  .6,-1,0,
                    0.498039, 1, 0.831373,    0, 0.545098, 0.545098,    0,1,0,
                    0, 0.74902, 1,     0.498039, 1, 0.831373,     0,1,0,
                    0,1,0,      0, 0.545098, 0.545098,    .8,1,0,
                    //Eye
                    0,0,0,      0,0,0,      0,0,0,
                    0,0,0,      0,0,0,      0,0,0,

                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };

    Tree.prototype.draw = function(drawingState) {
        // we make a model matrix to place the tree in the world
        t += .01;
        var modelM = twgl.m4.scaling([this.size[0],this.size[1],this.size[2]]);
        var rot = m4.multiply(modelM, m4.rotationY(Math.PI / this.rot));
        twgl.m4.setTranslation(rot,this.position,modelM);
         var Tmodel_trans=m4.translation([t,Math.sin(t)*10,0]);
         var Tmodel_rot=m4.rotationZ(Math.sin(t));
         var Tmodel=m4.multiply(Tmodel_rot,m4.multiply(Tmodel_trans, modelM));
        if(t > 11){
            t = 0;
        }
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            treecolor:this.color, model: Tmodel });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Tree.prototype.center = function(drawingState) {
        return this.position;
    }

})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of trees, just don't load this file.

//Outside Corners
grobjects.push(new Tree("fish",[10,2.0,4],[.5,.25,.5],10));
grobjects.push(new Tree("fish",[9,1.5,5],[.5,.25,.5],2));
grobjects.push(new Tree("fish",[13.5,0.5,4],[.5,.25,.5],1));
