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
var tractor = 0;
var v3 = twgl.v3;



// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all trees - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;
    var buffers2 = undefined;

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
                    //Front
                    1,0,2, -1,0,2,    -1,-1.5,2,
                    1,0,2,-1,-1.5,2,  1,-1.5,2,

                    1,0,-.5,    -1,0,-.5,   1,-1.5,-.5,
                    -1,0,-.5,   1,-1.5,-.5, -1,-1.5,-.5,

                    -1,0,-.5,   1,0,2,  -1,0,2,
                    -1,0,-.5,1,0,-.5,   1,0,2,

                    -1,-1.5,-.5,   1,-1.5,2,  -1,-1.5,2,
                    -1,-1.5,-.5,1,-1.5,-.5,   1,-1.5,2,

                    -1,0,-.5,   -1,0,2, -1,-1.5,2,
                    -1,0,-.5,   -1,-1.5,2,  -1,-1.5,-.5,

                    1,0,-.5,   1,0,2, 1,-1.5,2,
                    1,0,-.5,   1,-1.5,2,  1,-1.5,-.5,

                    //cabin
                    //Window
                    -1,2.5,-.5,    1,2.5,-.5,   1,0,-.5,
                    -1,2.5,-.5,     1,0,-.5,    -1,0,-.5,
                    -1,1.25,-1,     -1,2.5,-.5, -1,0,-.5,
                    1,1.25,-1,     1,2.5,-.5, 1,0,-.5,

                    //Other
                    -1,2.5,-1.5,    1,2.5,-1.5,   1,0,-1.5,
                    -1,2.5,-1.5,     1,0,-1.5,    -1,0,-1.5,

                    -1,2.5,-1.5,    -1,2.5,-.5,     -1,1.25,-1,
                    -1,2.5,-1.5,    -1,0,-.5,       -1,0,-1.5,

                    1,2.5,-1.5,    1,2.5,-.5,     1,1.25,-1,
                    1,2.5,-1.5,    1,0,-.5,       1,0,-1.5,
                    //Top & botton
                    -1,2.5,-1.5,    -1,2.5,-.5,     1,2.5,-.5,
                    -1,2.5,-1.5,    1,2.5,-1.5,     1,2.5,-.5,

                    -1,0,-1.5,    -1,0,-.5,     1,0,-.5,
                    -1,0,-1.5,    1,0,-1.5,     1,0,-.5,

                    //Pillar
                    -.2,0,.2+1,-.2,2,.2+1,.2,0,.2+1,
                    -.2,2,.2+1,.2,0,.2+1,.2,2,.2+1,

                    -.2,0,-.2+1,-.2,2,-.2+1,.2,0,-.2+1,
                    -.2,2,-.2+1,.2,0,-.2+1,.2,2,-.2+1,

                    -.2,2,-.2+1,-.2,2,.2+1,-.2,0,.2+1,
                    -.2,2,-.2+1,-.2,0,.2+1,-.2,0,-.2+1,

                    .2,2,-.2+1,.2,2,.2+1,.2,0,.2+1,
                    .2,2,-.2+1,.2,0,.2+1,.2,0,-.2+1,

                    //Wheels
                    -1.1,-2,-.5, -1.1,-2,-1.5,   -1.1,-.75,-2,
                    -1.1,-2,-.5, -1.1,-.75,-2, -1.1,-.25,-2,
                    -1.1,-2,-.5, -1.1,-.25,-2,  -1.1,1,-1.5,
                    -1.1,-2,-.5,-1.1,1,-1.5,    -1.1,1,-.5,
                    -1.1,-2,-.5,-1.1,1,-.5, -1.1,-.25,0,
                    -1.1,-2,-.5,-1.1,-.25,0, -1.1,-.75,0,

                    //Wheels
                    1.1,-2,-.5, 1.1,-2,-1.5,   1.1,-.75,-2,
                    1.1,-2,-.5, 1.1,-.75,-2, 1.1,-.25,-2,
                    1.1,-2,-.5, 1.1,-.25,-2,  1.1,1,-1.5,
                    1.1,-2,-.5,1.1,1,-1.5,    1.1,1,-.5,
                    1.1,-2,-.5,1.1,1,-.5, 1.1,-.25,0,
                    1.1,-2,-.5,1.1,-.25,0, 1.1,-.75,0,

                ] },
                vnormal : {numComponents:3, data: [
                    //Front
                    1,0,2, -1,0,2,    -1,-1.5,2,
                    1,0,2,-1,-1.5,2,  1,-1.5,2,

                    1,0,-.5,    -1,0,-.5,   1,-1.5,-.5,
                    -1,0,-.5,   1,-1.5,-.5, -1,-1.5,-.5,

                    -1,0,-.5,   1,0,2,  -1,0,2,
                    -1,0,-.5,1,0,-.5,   1,0,2,

                    -1,-1.5,-.5,   1,-1.5,2,  -1,-1.5,2,
                    -1,-1.5,-.5,1,-1.5,-.5,   1,-1.5,2,

                    -1,0,-.5,   -1,0,2, -1,-1.5,2,
                    -1,0,-.5,   -1,-1.5,2,  -1,-1.5,-.5,

                    1,0,-.5,   1,0,2, 1,-1.5,2,
                    1,0,-.5,   1,-1.5,2,  1,-1.5,-.5,

                    //cabin
                    //Window
                    -1,2.5,-.5,    1,2.5,-.5,   1,0,-.5,
                    -1,2.5,-.5,     1,0,-.5,    -1,0,-.5,
                    -1,1.25,-1,     -1,2.5,-.5, -1,0,-.5,
                    1,1.25,-1,     1,2.5,-.5, 1,0,-.5,

                    //Other
                    -1,2.5,-1.5,    1,2.5,-1.5,   1,0,-1.5,
                    -1,2.5,-1.5,     1,0,-1.5,    -1,0,-1.5,

                    -1,2.5,-1.5,    -1,2.5,-.5,     -1,1.25,-1,
                    -1,2.5,-1.5,    -1,0,-.5,       -1,0,-1.5,

                    1,2.5,-1.5,    1,2.5,-.5,     1,1.25,-1,
                    1,2.5,-1.5,    1,0,-.5,       1,0,-1.5,
                    //Top & botton
                    -1,2.5,-1.5,    -1,2.5,-.5,     1,2.5,-.5,
                    -1,2.5,-1.5,    1,2.5,-1.5,     1,2.5,-.5,

                    -1,0,-1.5,    -1,0,-.5,     1,0,-.5,
                    -1,0,-1.5,    1,0,-1.5,     1,0,-.5,
                    //Pillar
                    -.2,0,.2,-.2,2,.2,.2,0,.2,
                    -.2,2,.2,.2,0,.2,.2,2,.2,

                    -.2,0,-.2,-.2,2,-.2,.2,0,-.2,
                    -.2,2,-.2,.2,0,-.2,.2,2,-.2,

                    -.2,2,-.2,-.2,2,.2,-.2,0,.2,
                    -.2,2,-.2,-.2,0,.2,-.2,0,-.2,

                    .2,2,-.2,.2,2,.2,.2,0,.2,
                    .2,2,-.2,.2,0,.2,.2,0,-.2,

                    //Wheels
                    -1.1,-2,-.5, -1.1,-2,-1.5,   -1.1,-.75,-2,
                    -1.1,-2,-.5, -1.1,-.75,-2, -1.1,-.25,-2,
                    -1.1,-2,-.5, -1.1,-.25,-2,  -1.1,1,-1.5,
                    -1.1,-2,-.5,-1.1,1,-1.5,    -1.1,1,-.5,
                    -1.1,-2,-.5,-1.1,1,-.5, -1.1,-.25,0,
                    -1.1,-2,-.5,-1.1,-.25,0, -1.1,-.75,0,


                    //Wheels
                    1.1,-2,-.5, 1.1,-2,-1.5,   1.1,-.75,-2,
                    1.1,-2,-.5, 1.1,-.75,-2, 1.1,-.25,-2,
                    1.1,-2,-.5, 1.1,-.25,-2,  1.1,1,-1.5,
                    1.1,-2,-.5,1.1,1,-1.5,    1.1,1,-.5,
                    1.1,-2,-.5,1.1,1,-.5, 1.1,-.25,0,
                    1.1,-2,-.5,1.1,-.25,0, 1.1,-.75,0,


                ]},

                vcolor : {numComponents:3, data: [
                    //Front
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,

                    //cabin
                    //Window
                    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,
                    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,
                    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,
                    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,    0.392157, 0.584314, 0.929412,

                    //Other
                    0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,
                    0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,

                    0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,
                    0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,

                    0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,
                    0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,   0.647059, 0.164706, 0.164706,

                    //Top & botton
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,

                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    0.545098, 0, 0, 0.545098, 0, 0,    0.545098, 0, 0,
                    //Pillar
                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,
                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,

                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,
                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,

                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,
                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,

                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,
                    0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,0.333333, 0.333333, 0.333333,

                    //Wheels
                     0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                     0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                     0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                     0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                     0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                     0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,



                    //Wheels
                    0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                    0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                    0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                    0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                    0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,
                    0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,0.156863, 0.156863, 0.156863,




                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

        }

    };

    var p0=[0,0,0];
    var d0=[0,0,0];
    var p1=[5,0,5];
    var d1=[0,0,0];
    var P = [p0,d0,p1,d1];

    var direct = 0;
    Tree.prototype.draw = function(drawingState) {
     // All the control points




        if(tractor >= 1){
            tractor = 0;
            if(direct == 0){
                p0=[5,0,5];
                d0=[0,0,0];
                p1=[-10,0,-15];
                d1=[0,0,0];
                P = [p0,d0,p1,d1];

            }
            if(direct == 1){
                p0=[-10,0,-15];
                d0=[0,0,0];
                p1=[10,0,-9];
                d1=[0,0,0];
                P = [p0,d0,p1,d1];
            }
            if(direct == 2){
                p0=[10,0,-9];
                d0=[0,0,0];
                p1=[5,0,-12];
                d1=[0,0,0];
                P = [p0,d0,p1,d1];

            }
            if(direct == 3){
                p0=[5,0,-12];
                d0=[0,0,0];
                p1=[15,0,0];
                d1=[0,0,0];
                P = [p0,d0,p1,d1];

            }
            if(direct == 4){
                p0=[15,0,0];
                d0=[0,0,0];
                p1=[5,0,5];
                d1=[0,0,0];
                P = [p0,d0,p1,d1];
                direct =-1;
            }

            direct++;
        }
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us

        // we make a model matrix to place the tree in the world
        tractor += .005;
        var modelM = twgl.m4.scaling([this.size[0],this.size[1],this.size[2]]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        var rot = m4.multiply(m4.rotationY(Math.PI / this.rot), modelM);
         var Tmodel_trans=m4.translation(Cubic(Hermite,P,tractor));
         var Tmodel_rot=m4.lookAt([0,0,0],Cubic(HermiteDerivative,P,t),[0,1,0]);
         var Tmodel=m4.multiply(Tmodel_rot,m4.multiply(Tmodel_trans, rot));

        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            tractorcolor:this.color, model: Tmodel });
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
grobjects.push(new Tree("Tractor",[0,2,-9],[1,1,1]));



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
