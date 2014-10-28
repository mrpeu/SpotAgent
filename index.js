

var coloursHex = ["#2E2E2E", "#FD1811", "#F54B45", "#F68D0C", "#ECF00F", "#91C878", "#00B9D2"];

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

var coloursRGB = [];
coloursHex.forEach(function (c) {
  coloursRGB.push(hexToRgb(c));
});

CEILING_HEIGHT = 120;
FLOOR_SIZE = 300;

function init() {

  var renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.setClearColor(0x000000, 1);

  camOrthographic = false;

  if (camOrthographic) {
    var camFactor = 10;
    var camera = new THREE.OrthographicCamera(window.innerWidth / -camFactor, window.innerWidth / camFactor, window.innerHeight / camFactor, window.innerHeight / -camFactor, 1, 1000);
  } else {
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  }
  camera.position.set(60, 60, 250);
  camera.target = new THREE.Vector3(0, 40, 0);
  camera.lookAt(camera.target);

  var controls = new THREE.OrbitControls(camera);
  controls.addEventListener('change', render);

  var scene = new THREE.Scene();


  //var axis = new THREE.AxisHelper(100);
  //axis.position.set(0, 1, 0);
  //scene.add(axis);

  var material = new THREE.MeshNormalMaterial();
  var itemPositions = [],
      itemScales = [];
  var items = [];

  var floor = function initFloor(w, h) {

    var g = new THREE.PlaneGeometry(w, h, w / 4, w / 4);

    var m = new THREE.ShaderMaterial({

      uniforms: {
        positions: { type: 'v3v', value: null },
        scales: { type: 'fv1', value: null },
        color: { type: 'c', value: new THREE.Color(0xcccccc) }
      },

      vertexShader: document.getElementById('vsFloor').textContent,
      fragmentShader: document.getElementById('fsFloor').textContent,

    });

    //m = new 

    //m = new THREE.MeshLambertMaterial({ color: 0xaaffbb });

    var mesh = new THREE.Mesh(g, m);
    mesh.rotation.set(-Math.PI / 2, 0, 0);
    mesh.name = "floor";

    return mesh;
  }(FLOOR_SIZE, FLOOR_SIZE);
  scene.add( floor );

  var ceiling = function initCeiling(w, h) {

    var g = new THREE.PlaneGeometry(w, h);

    var m = new THREE.MeshBasicMaterial({ color: 0xffffff });

    var mesh = new THREE.Mesh(g, m);
    mesh.position.set(0, CEILING_HEIGHT, 0);
    mesh.rotation.set(Math.PI / 2, 0, 0);
    mesh.name = "ceiling";

    return mesh;

  }(FLOOR_SIZE, FLOOR_SIZE);
  scene.add( ceiling );
/*
  var wall = function initWall(w, h) {
    var gridRatio = .10;

    var g = new THREE.PlaneGeometry( w, h, w*gridRatio, h*gridRatio);

    var m = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, wireframeLinewidth: 10 });

    var mesh = new THREE.Mesh(g, m);
    mesh.position.set(0, h/2, -20);
    mesh.rotation.set(0, 0, 0);
    mesh.name = "wall";

    return mesh;

  }(FLOOR_SIZE, CEILING_HEIGHT);
  scene.add( wall );
*/
  

  /***********
   * lights
   ***********/
/*
  function initLight() {
    var dir = new THREE.DirectionalLight(0xededed, .4);
    dir.position.set(0, 10, 0);
    scene.add(dir);

    var ambi = new THREE.AmbientLight(0xededed); // soft white light
    scene.add(ambi);
  }
  initLight();
*/


  var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.IcosahedronGeometry(.5, 3));

  geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.array.length), 3));

  var image = document.createElement('img');
  image.src = dataurlMatcap2;
  var texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  //var texture = new THREE.Texture();

  material = new THREE.ShaderMaterial({
    uniforms: {
      positions: { type: 'v3v', value: null },
      scales: { type: 'fv1', value: null },
      tMatCap: { type: 't', value: texture }
    },
    vertexShader: document.getElementById('vs').textContent,
    fragmentShader: document.getElementById('fs').textContent,
    shading: THREE.SmoothShading,
    vertexColors: THREE.FaceColors
  });

  function addSphere(index) {

    var scale = 2 + Math.random() * 50;

    var mesh = new THREE.Mesh(geometry.clone(), material);

    mesh.position.set(Math.random() * 100 - 50, Math.random() * (CEILING_HEIGHT - scale), Math.random() * 100 - 50);
    mesh._position = mesh.position.clone();

    mesh.scale.set(scale, scale, scale);
    mesh.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);

    mesh._coeffX = Math.random() * 100;
    mesh._coeffY = mesh._position.y;
    mesh._coeffZ = Math.random() * 100;
    scene.add(mesh);

    itemPositions.push(mesh.position.clone());
    itemScales.push(scale * scale);

    updateSphereColor(mesh);

    return mesh;
  }

  function updateSphereColor(mesh) {

    var color = coloursRGB[Math.floor(Math.random() * coloursRGB.length)];
    var colors = mesh.geometry.attributes.color.array;

    for (var j = 0; j < colors.length; j += 3) {
      colors[j] = color.r / 255;
      colors[j + 1] = color.g / 255;
      colors[j + 2] = color.b / 255;
    }
  }

  for (var j = 0; j < 20; j++) {

    var m = addSphere(j);
    m.name = "sphere#" + j;
    items.push(m);

  }

  for (var j = 0; j < items.length; j++) {
    items[j].material.uniforms.positions.value = itemPositions;
    items[j].material.uniforms.scales.value = itemScales;
  }

  if (floor.material.uniforms !== undefined) {
    floor.material.uniforms.positions.value = itemPositions;
    floor.material.uniforms.scales.value = itemScales;
  }


  /*************
   * Render loop
   **************/

  var pt = Date.now();

  function render() {

    requestAnimationFrame(render);

    var t = Date.now();
    var dt = t - pt;

    time = t * .00005;

    if (dt > 15) {

      items.forEach(function (item, i) {

        item.position.setX(Math.cos(time + item._coeffX) * item._coeffX + item._position.x);
        item.position.setY((Math.cos(time + item._coeffY / 4) - 1) * item._coeffY / 2 + item._position.y + item.scale.y / 2);
        item.position.setZ( Math.cos(time + item._coeffZ) * item._coeffZ + item._position.z );

        item.material.uniforms.positions.value[i] = item.position;

      });

      pt = Date.now();
      renderer.render(scene, camera);
    }
  }

  function onWindowResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (camOrthographic) {
      camera.left = -window.innerWidth / camFactor;
      camera.right = window.innerWidth / camFactor;
      camera.top = window.innerHeight / camFactor;
      camera.bottom = -window.innerHeight / camFactor;
    } else {
      camera.aspect = window.innerWidth / window.innerHeight;
    }

    camera.updateProjectionMatrix();

  }

  window.addEventListener('resize', onWindowResize);





  /*************
   * Gauge
   **************/
/*
  var gauge = function initGauge() {

    var size = 25;

    // instantiate object
    var mesh = new THREE.Mesh(
      //geometry.clone(),
      new THREE.IcosahedronGeometry(.5, 3),
      new THREE.MeshLambertMaterial({ color: 0x00B9D2, ambient: 0x00B9D2 })
    );

    // setup
    mesh.scale.set(size, size, size);
    mesh.position.set(0, 0, 80);



    return mesh;
  }();
  scene.add(gauge);
*/




  render();
}

window.addEventListener('load', init);
