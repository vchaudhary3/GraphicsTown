var grobjects = grobjects || [];


(function() {
    "use strict";
//aColor acts as the NORMAL--------
    var vertexSource = ""+
        "precision highp float;" +
        "attribute vec3 aPosition;" +
        "attribute vec2 aTexCoord;" +
        "attribute vec3 aNormal;"+
        "varying vec2 vTexCoord;" +
        "varying vec3 fNormal;"+
        "varying vec3 fPosition;"+
        "uniform mat4 pMatrix;" +
        "uniform mat4 vMatrix;" +
        "uniform mat4 mMatrix;" +
        "void main(void) {" +
        "  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aPosition, 1.0);" +
        "  vTexCoord = aTexCoord;" +
        "  fNormal = normalize(vMatrix * mMatrix * vec4(aNormal,0.0)).xyz;"+
        "  fPosition = (vMatrix * mMatrix * vec4(aPosition, 1.0)).xyz;"+
        "}";

        var fragmentSource = "" +
            "precision highp float;" +
            "varying vec2 vTexCoord;" +
            "varying vec3 fNormal;"+
            "varying vec3 fPosition;"+
            "uniform sampler2D uTexture;" +
            "uniform vec3 lightdir;"+
            "const float Ka         = 1.5;" +
            "const float Kd         = 0.9;" +
            "const float Ks         = 1.0;" +
            "const float sExp       = 52.0;" +
            "const vec3  lightPos   = vec3(100.0,00.0,0.0);" +
            "const vec3  lightCol   = vec3(0,1.0,1.0);" +
            "void main(void) {" +
            "float diffuse = .8 + dot(fNormal,lightdir);"+
            "vec4 texColor = texture2D(uTexture,vTexCoord);" +
              "gl_FragColor = vec4((texColor.xyz),texColor.a);" +
            "}";

var numVertex = 6;
    var vertices = new Float32Array([
        -1.0,  0,  1.0,
        1.0,  0,  -1.0,
        -1.0,  0,  -1.0,

        -1.0,  0,  1.0,
        1.0,  0,  1.0,
        1.0,  0,  -1.0,
    ]);

    var uvs = new Float32Array([

                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,

                0.0, 1.0,
                1.0, 1.0,
                1.0, 0.0,

    ]);

    var vnormal = new Float32Array([
        //Front
         0,0,0,
         0,0,0,
         0,0,0,

         0,0,0,
         0,0,0,
         0,0,0,


    ]);





    //useful util function to simplify shader creation. type is either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    var createGLShader = function (gl, type, src) {
        var shader = gl.createShader(type)
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log("warning: shader failed to compile!")
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    //see above comment on how this works.
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = "https://farm6.staticflickr.com/5705/31299612172_8ffc2d0532_b.jpg";


  //useful util function to return a glProgram from just vertex and fragment shader source.
    var createGLProgram = function (gl, vSrc, fSrc) {
        var program = gl.createProgram();
        var vShader = createGLShader(gl, gl.VERTEX_SHADER, vSrc);
        var fShader = createGLShader(gl, gl.FRAGMENT_SHADER, fSrc);
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            console.log("warning: program failed to link");
            return null;

        }
        return program;
    }

    //creates a gl buffer and unbinds it when done.
    var createGLBuffer = function (gl, data, usage) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    var findAttribLocations = function (gl, program, attributes) {
        var out = {};
        for(var i = 0; i < attributes.length;i++){
            var attrib = attributes[i];
            out[attrib] = gl.getAttribLocation(program, attrib);
        }
        return out;
    }

    var findUniformLocations = function (gl, program, uniforms) {
        var out = {};
        for(var i = 0; i < uniforms.length;i++){
            var uniform = uniforms[i];
            out[uniform] = gl.getUniformLocation(program, uniform);
        }
        return out;
    }

    var enableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.enableVertexAttribArray(location);
        }
    }

    //always a good idea to clean up your attrib location bindings when done. You wont regret it later.
    var disableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.disableVertexAttribArray(location);
        }
    }

    //creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
    //it's mostly going to be a try it once, flip if you need to.
    var createGLTexture = function (gl, image, flipY) {

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

     var Corn = function (position, rot) {
        this.name = "skybox"
        this.position = position || new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1]);
        this.program = null;
        this.attributes = null;
        this.uniforms = null;
        this.buffers = [null, null, null];
        this.texture = null;
        this.rot = rot || 100000.0;
    }

    Corn.prototype.init = function (drawingState) {
        var gl = drawingState.gl;

        this.program = createGLProgram(gl, vertexSource, fragmentSource);
        this.attributes = findAttribLocations(gl, this.program, ["aPosition", "aTexCoord", "aNormal"]);
        this.uniforms = findUniformLocations(gl, this.program, ["pMatrix", "vMatrix", "mMatrix", "uTexture", "lightdir"]);

        this.texture = createGLTexture(gl, image, true);

        this.buffers[0] = createGLBuffer(gl, vertices, gl.STATIC_DRAW);
        this.buffers[1] = createGLBuffer(gl, uvs, gl.STATIC_DRAW);
        this.buffers[2] = createGLBuffer(gl, vnormal, gl.STATIC_DRAW);
    }

    Corn.prototype.center = function () {
        return this.position;
    }

    Corn.prototype.draw = function (drawingState) {
        if(document.getElementById("skybox").checked == true){
        var gl = drawingState.gl;

        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);

        var modelM = twgl.m4.scaling([this.scale[0],this.scale[1], this.scale[2]]);
        twgl.m4.setTranslation(modelM,this.position, modelM);
        var fin = twgl.m4.multiply(m4.rotationY(Math.PI), modelM);

        gl.uniformMatrix4fv(this.uniforms.pMatrix, gl.FALSE, drawingState.proj);
        gl.uniformMatrix4fv(this.uniforms.vMatrix, gl.FALSE, drawingState.view);
        gl.uniformMatrix4fv(this.uniforms.mMatrix, gl.FALSE, fin);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniforms.uTexture, 0);
        gl.uniform3f(this.uniforms.lightdir, drawingState.sunDirection[0],drawingState.sunDirection[1],drawingState.sunDirection[2]);


        enableLocations(gl, this.attributes)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(this.attributes.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(this.attributes.aTexCoord, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.vertexAttribPointer(this.attributes.aNormal, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, numVertex);

        disableLocations(gl, this.attributes);
    }
    }





// Ground
            var ground = new Corn([0,0,0]);
                ground.scale = [50, 50, 50];
            grobjects.push(ground);



})();
