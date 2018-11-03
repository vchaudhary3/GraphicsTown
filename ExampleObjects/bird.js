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
var bird = 0;
var v3 = twgl.v3;



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
        this.rot = rot || 1000.0;
    }
    Tree.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all trees
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["bird-vs", "bird-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    //Torso
                    // 2,1,0,  2,-1,-1,    -2,-1,-1,
                    // 2,1,0,  -2,1,0,     -2,-1,-1,
                    // -2,1,0,  -2,-1,1,    -2,-1,-1,
                    // 2,1,0,  2,-1,-1,    2,-1,1,
                    // 2,1,0,  2,-1,1,     -2,-1,1,
                    // 2,1,0,  -2,1,0,     -2,-1,1,
                    // 2,-1,-1,    -2,-1,-1,   2,-1,1,
                    // 2,-1,1, -2,-1,-1,   -2,-1,1,
                    //Body
                    0,.5,2, 1,-.5,2,    -1,-.5,2,
                    0,.5,-2,    1,-.5,-2,   -1,-.5,-2,
                    0,.5,2,   0,.5,-2,    1,-.5,-2,
                    0,.5,2,     1,-.5,2,    1,-.5,-2,
                    0,.5,2,     -1,-.5,-2,  -1,-.5,2,
                    0,.5,2,     0,.5,-2,    -1,-.5,-2,
                    1,-.5,2,    1,-.5,-2,   -1,-.5,2,
                    -1,-.5,2,   -1,-.5,-2,  1,-.5,-2,

                    //Head
                    //Front
                    -.5,.5,2,   .5,.5,2,    -.5,1.5,2,
                    -.5,1.5,2,    .5,1.5,2, .5,.5,2,

                    -.5,.5,1.5,   .5,.5,1.5,    -.5,1.5,1.5,
                    -.5,1.5,1.5,    .5,1.5,1.5, .5,.5,1.5,

                    //Top
                    -.5,1.5,1.5,    .5,1.5,1.5, .5,1.5,2,
                    .5,1.5,2,       -.5,1.5,1.5,    -.5,1.5,2,
                    -.5,.5,1.5,    .5,.5,1.5, .5,.5,2,
                    .5,.5,2,       -.5,.5,1.5,    -.5,.5,2,

                    //RL
                    .5,1.5,2,.5,.5,1.5,.5,.5,2,
                    .5,1.5,2,   .5,1.5,1.5, .5,.5,1.5,
                    -.5,1.5,2,  -.5,.5,1.5, -.5,.5,2,
                    -.5,1.5,2,   -.5,1.5,1.5,   -.5,.5,1.5,

                    //wings
                    0,.5,1,     1,-.5,1,    3,.7,1,
                    1.4,.6,1,   3.2,2.0,1,  3,.7,1,

                    0,.5,1,     -1,-.5,1,    -3,.7,1,
                    -1.4,.6,1,  -3.2,2.0,1, -3,.7,1,

                    //Tails
                    0,1.5-.5,-2.1,   .4,.4-.5,-2.1,     -.4,.4-.5,-2.1,
                    .4,.4-.5,-2.1,   .6,.1-.5,-2.1,      .5,1.2-.5,-2.1,
                    -.4,.4-.5,-2.1,   -.6,.1-.5,-2.1,      -.5,1.2-.5,-2.1,

                    //eYES
                    -.25,1.4,2.1,   -.35,1.1,2.1,  -.15,1.1,2.1,
                    .25,1.4,2.1,   .35,1.1,2.1,  .15,1.1,2.1,

                    //Beek
                    -.25,1,2.0,    .25,1,2.0,   0,1.2,2.5,
                    -.25,1,2.0,    .25,1,2.0,   0,.8,2.5,



                ] },
                vnormal : {numComponents:3, data: [
                    0,.5,2, 1,-.5,2,    -1,-.5,2,
                    0,.5,-2,    1,-.5,-2,   -1,-.5,-2,
                    0,.5,2,   0,.5,-2,    1,-.5,-2,
                    0,.5,2,     1,-.5,2,    1,-.5,-2,
                    0,.5,2,     -1,-.5,-2,  -1,-.5,2,
                    0,.5,2,     0,.5,-2,    -1,-.5,-2,
                    1,-.5,2,    1,-.5,-2,   -1,-.5,2,
                    -1,-.5,2,   -1,-.5,-2,  1,-.5,-2,
                    //Head
                    -.5,.5,2,   .5,.5,2,    -.5,1,2,
                    -.5,1,2,    .5,1,2, .5,.5,2,
                    -.5,.5,-2,   .5,.5,-2,    -.5,1.5,-2,
                    -.5,1.5,-2,    .5,1.5,-2, .5,.5,-2,
                    -.5,1.5,1.5,    .5,1.5,1.5, .5,1.5,2,
                    .5,1.5,2,       -.5,1.5,1.5,    -.5,1.5,2,
                    -.5,.5,1.5,    .5,.5,1.5, .5,.5,2,
                    .5,.5,2,       -.5,.5,1.5,    -.5,.5,2,
                    .5,1.5,2,.5,.5,1.5,.5,.5,2,
                    .5,1.5,2,   .5,1.5,1.5, .5,.5,1.5,
                    -.5,1.5,2,  -.5,.5,1.5, -.5,.5,2,
                    -.5,1.5,2,   -.5,1.5,1.5,   -.5,.5,1.5,

                    0,.5,1, 1,-.5,1,    3,.7,1,
                    1.4,.6,1,3.2,2.0,1, 3,.7,1,
                    0,.5,1, 1,-.5,1,    3,.7,1,
                    1.4,.6,1,3.2,2.0,1, 3,.7,1,

                    0,1,-2.1,   .2,.4,-2,1,     -.2,.4,-2.1,
                    .4,.4,-2.1,   .6,.1,-2.1,      .5,1.2,-2.1,
                    -.4,.4,-2.1,   .6,.1,-2.1,      .5,1.2,-2.1,

                    -.25,1,2.1,   -.35,.8,2.1,  -.45,.8,2.1,
                    .25,1,2.1,   .35,.8,2.1,  .45,.8,2.1,

                    -.25,1,2.0,    .25,1,2.0,   0,1.2,2.5,
                    -.25,1,2.0,    .25,1,2.0,   0,.8,2.5,


                ]},

                vcolor : {numComponents:3, data: [
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,
                    0, 0, 0.501961, 0.117647, 0.564706, 1,    0, 0, 0.501961,

                    //Head
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,

                    //Wings
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,

                    //Tails
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,
                    1,1,1,  1,1,1,  1,1,1,

                    //eYES
                    0,0,0,   0,0,0,  0,0,0,
                    0,0,0,   0,0,0,  0,0,0,

                    //Beak
                    1, 0.843137, 0, 1, 0.843137, 0,1, 0.843137, 0,
                    1, 0.843137, 0,1, 0.843137, 0,1, 0.843137, 0,

                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };

    var p0=[0,0,0];
    var d0=[1,0,0];
    var p1=[5,5,5];
    var d1=[0,5,0];
    var P = [p0,d0,p1,d1];

    var directionCount = 0;
    Tree.prototype.draw = function(drawingState) {
     // All the control points



        // we make a model matrix to place the tree in the world
        bird += .005;
        var modelM = twgl.m4.scaling([this.size[0],this.size[1],this.size[2]]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        var rot = m4.multiply(m4.rotationY(Math.PI / this.rot), modelM);
         var Tmodel_trans=m4.translation(Cubic(Hermite,P,bird));
         var Tmodel_rot=m4.lookAt([0,0,0],Cubic(HermiteDerivative,P,t),[0,1,0]);
         var Tmodel=m4.multiply(Tmodel_rot,m4.multiply(Tmodel_trans, rot));

        if(bird >= 1){
            bird = 0;
            if(directionCount == 0){
                p0=[5,5,5];
                d0=[0,5,0];
                p1=[-10,8,-15];
                d1=[1,0,0];
                P = [p0,d0,p1,d1];

            }
            if(directionCount == 1){
                p0=[-10,8,-15];
                d0=[1,0,0];
                p1=[10,4,-9];
                d1=[1,4,0];
                P = [p0,d0,p1,d1];
            }
            if(directionCount == 2){
                p0=[10,4,-9];
                d0=[1,4,0];
                p1=[5,3,-12];
                d1=[1,0,0];
                P = [p0,d0,p1,d1];

            }
            if(directionCount == 3){
                p0=[5,3,-12];
                d0=[1,4,0];
                p1=[15,3,0];
                d1=[1,0,0];
                P = [p0,d0,p1,d1];

            }
            if(directionCount == 4){
                p0=[15,3,0];
                d0=[1,4,0];
                p1=[-15,9,-4];
                d1=[1,0,0];
                P = [p0,d0,p1,d1];

            }
            if(directionCount == 5){
                p0=[-15,9,-4];
                d0=[1,4,0];
                p1=[5,5,5];
                d1=[1,0,0];
                P = [p0,d0,p1,d1];
                directionCount =-1;
            }
            directionCount++;
        }
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            birdcolor:this.color, model: Tmodel });
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
grobjects.push(new Tree("bird",[0,2,1.5],[.5,.5,.5],10));
grobjects.push(new Tree("bird",[-4,4,5],[.5,.5,.5],2));


function Cubic(basis,P,t){
  var b = basis(t);
  var result=v3.mulScalar(P[0],b[0]);
  v3.add(v3.mulScalar(P[1],b[1]),result,result);
  v3.add(v3.mulScalar(P[2],b[2]),result,result);
  v3.add(v3.mulScalar(P[3],b[3]),result,result);
  return result;
}


var Hermite = function(t) {
    return [
      2*t*t*t-3*t*t+1,
      t*t*t-2*t*t+t,
      -2*t*t*t+3*t*t,
      t*t*t-t*t
    ];
}

var HermiteDerivative = function(t) {
    return [
      6*t*t-6*t,
      3*t*t-4*t+1,
      -6*t*t+6*t,
      3*t*t-2*t
    ];
}
