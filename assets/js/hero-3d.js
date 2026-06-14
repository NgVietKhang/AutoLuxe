/* =============================================
   HERO-3D.JS - AutoLuxe Supercar Web
   Fixed side-profile McLaren, camera parallax,
   click accel/brake, digital speedo, synth engine.
   Falls back to static .hero__bg when WebGL or
   prefers-reduced-motion is unavailable.
   ============================================= */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

(function () {
  'use strict';

  function preloadBump() {
    if (window.AutoLuxePreload && typeof window.AutoLuxePreload.bump === 'function') {
      window.AutoLuxePreload.bump();
    }
  }

  function preloadSetProgress(ratio) {
    if (window.AutoLuxePreload && typeof window.AutoLuxePreload.setAssetProgress === 'function') {
      window.AutoLuxePreload.setAssetProgress('hero', ratio);
    }
  }

  function onLoadProgress(xhr) {
    var ratio = 0;
    if (xhr.total > 0) {
      ratio = xhr.loaded / xhr.total;
    } else if (xhr.loaded > 0) {
      ratio = Math.min(0.9, xhr.loaded / 4000000);
    }
    preloadSetProgress(ratio);
  }

  var stage = document.getElementById('heroStage');
  var hero = document.querySelector('.hero');
  if (!stage || !hero) return;

  var prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (prefersReduced) {
    document.dispatchEvent(new CustomEvent('autoluxe:hero3d-failed'));
    return;
  }

  function hasWebGL() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('webgl2')));
    } catch (e) {
      return false;
    }
  }
  if (!hasWebGL()) {
    preloadSetProgress(1);
    preloadBump();
    document.dispatchEvent(new CustomEvent('autoluxe:hero3d-failed'));
    return;
  }

  document.documentElement.classList.add('hero-3d-active');

  window.AutoLuxeHero3D = {
    active: false,
    isReady: function () { return isLoaded; },
    playIntro: function () { startIntro(); },
    setExitProgress: function (p) {
      exitProgress = Math.max(0, Math.min(1, p));
      exitOffsetX = exitProgress * EXIT_DISTANCE;
      applyCarPosition();
    }
  };

  var speedoValueEl = document.getElementById('heroSpeedoValue');
  var speedoBarEl = document.getElementById('heroSpeedoBar');

  var MODEL_URL = 'assets/models/mclaren.glb';
  var DRACO_PATH = 'https://www.gstatic.com/draco/v1/decoders/';
  var MODEL_TARGET_SIZE = 4.3;
  var MODEL_Y_OFFSET = 0.6;

  /* Fixed pose: front 3/4 toward camera, front angled toward the left to reveal the body */
  var BASE_ROT_Y = Math.PI * 0.16;

  /* Camera parallax (subtle tilt toward cursor) */
  var CAM_PARALLAX_X = 0.52;
  var CAM_PARALLAX_Y = 0.20;
  var CAM_LERP = 0.09;

  /* Car body tilt toward cursor */
  var CAR_YAW_FROM_CURSOR = 0.07;
  var CAR_PITCH_FROM_CURSOR = 0.035;
  var CAR_TILT_LERP = 0.09;

  /* Cinematic drive-in / scroll-exit */
  var ENTER_DISTANCE = 7;
  var EXIT_DISTANCE = 9;
  var INTRO_DURATION = 1.3;
  var INTRO_DURATION_MOBILE = 1.0;
  var ROLL_PER_UNIT = 2.8;

  var CAMERA_Z_WIDE = 4.1;
  var CAMERA_Z_NARROW = 5.2;
  var CAMERA_Z_MOBILE = 6.4;
  var CAMERA_FOV_DEFAULT = 38;
  var CAMERA_FOV_MOBILE = 42;
  var MODEL_SCALE_MOBILE = 0.72;
  var CAR_OFFSET_X_WIDE = 1.45;
  var CAR_OFFSET_X_TABLET = 0.85;
  var MOBILE_BREAKPOINT = 768;

  /* Speed simulation */
  var MAX_KMH = 340;
  var ACCEL = 0.42;
  var BRAKE = 0.58;
  var FRICTION = 0.10;
  var WHEEL_SPIN_MIN = 0.35;
  var WHEEL_SPIN_MAX = 95;
  var WHEEL_SPEED_LERP = 0.18;

  var IDLE_FLOAT_SPEED = 0.35;
  var IDLE_FLOAT_AMP = 0.015;
  var IDLE_FLOAT_FADE_END = 0.06;

  var HEADLIGHT_PATTERN = /headlight|headlamp|head_light|head-lamp|drl|tail\s*light|taillight|fog\s*light|foglight|indicator|turn_signal|beam/i;
  var HEADLIGHT_EXCLUDE = /glass|window|windshield|windscreen|mirror|screen|body|paint|interior|seat|leather|carbon|trim|badge|logo|grille|grill|bumper|spoiler|wing|diffuser|exhaust|pipe|vent|panel|hood|bonnet|roof|door|fender|skirt|chassis|frame|under|floor|plate|license|number/i;
  var HEADLIGHT_EMISSIVE = 0xcfe8ff;
  var HEADLIGHT_INTENSITY = 3.0;

  var TIRE_MATERIAL_PATTERN = /tire|tyre/i;
  var SPIN_MATERIAL_PATTERN = /\btire\b|tyre|break_disc|brake_disc|carbon_fiber_procedural/i;
  var WHEEL_CYLINDER_SCALE = 1.15;
  var WHEEL_SINGLE_MESH_MAX_X = 0.55;
  var WHEEL_HUB_MERGE_DIST = 0.2;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  var cameraBase = new THREE.Vector3(0, 0.55, CAMERA_Z_WIDE);
  var lookAtTarget = new THREE.Vector3();
  camera.position.copy(cameraBase);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.7;
  stage.appendChild(renderer.domElement);

  var composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  var bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.5, 0.92);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.35));
  var keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);
  var rimLight = new THREE.DirectionalLight(0xbcd4ff, 0.32);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);

  var carGroup = new THREE.Group();
  scene.add(carGroup);

  var camTargetX = 0;
  var camTargetY = 0;
  var camCurrentX = 0;
  var camCurrentY = 0;
  var carOffsetX = 0;
  var driveOffsetX = 0;
  var exitOffsetX = 0;
  var exitProgress = 0;
  var prevMotionOffsetX = 0;
  var introStart = 0;
  var introActive = false;
  var introPlayed = false;
  var carTiltYaw = 0;
  var carTiltPitch = 0;
  var carTiltYawTarget = 0;
  var carTiltPitchTarget = 0;
  var idlePhase = 0;
  var lastFrame = 0;
  var isVisible = true;
  var isLoaded = false;
  var animId = 0;
  var modelBaseY = 0;
  var modelFitScale = 1;
  var carModel = null;

  var speed = 0;
  var leftDown = false;
  var rightDown = false;
  var wheelSpinSpeed = WHEEL_SPIN_MIN;

  var contactDisc = null;
  var RIM_BASE = 0.32;

  var wheelPivots = [];

  var _vLocal = new THREE.Vector3();
  var _relMatrix = new THREE.Matrix4();

  /* --- Web Audio engine synth --- */
  var audioCtx = null;
  var engine = null;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function applyCarPosition() {
    var x = carOffsetX + driveOffsetX + exitOffsetX;
    carGroup.position.x = x;
    if (contactDisc) {
      contactDisc.position.x = x;
    }
  }

  function applyCarRotation() {
    carGroup.rotation.y = BASE_ROT_Y + carTiltYaw;
    carGroup.rotation.x = carTiltPitch;
  }

  function isInteractiveTarget(el) {
    if (!el || !el.closest) return false;
    return !!el.closest('a, button, .btn, .hero__scroll-cue, .hero__content');
  }

  function initEngineAudio() {
    if (audioCtx) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    audioCtx = new Ctx();

    var master = audioCtx.createGain();
    master.gain.value = 0;
    master.connect(audioCtx.destination);

    var filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    filter.connect(master);

    var osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 62;
    var gain1 = audioCtx.createGain();
    gain1.gain.value = 0.14;
    osc1.connect(gain1);
    gain1.connect(filter);
    osc1.start();

    var osc2 = audioCtx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = 124;
    var gain2 = audioCtx.createGain();
    gain2.gain.value = 0.05;
    osc2.connect(gain2);
    gain2.connect(filter);
    osc2.start();

    var bufferSize = audioCtx.sampleRate * 2;
    var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    var noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    var noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.04;
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    noise.start();

    engine = {
      master: master,
      filter: filter,
      osc1: osc1,
      osc2: osc2,
      gain1: gain1,
      gain2: gain2,
      noiseGain: noiseGain
    };
  }

  function resumeEngineAudio() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function suspendEngineAudio() {
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend();
    }
  }

  function updateEngineAudio(speedNorm) {
    if (!audioCtx || !engine) return;

    var s = Math.max(0, Math.min(1, speedNorm));
    var t = audioCtx.currentTime;
    var vol = s < 0.02 ? 0 : 0.14 + s * 0.5;
    var freq1 = 58 + s * 195;
    var freq2 = freq1 * 2.02;
    var cutoff = 280 + s * 2200;

    engine.master.gain.setTargetAtTime(vol, t, 0.06);
    engine.osc1.frequency.setTargetAtTime(freq1, t, 0.05);
    engine.osc2.frequency.setTargetAtTime(freq2, t, 0.05);
    engine.filter.frequency.setTargetAtTime(cutoff, t, 0.08);
    engine.noiseGain.gain.setTargetAtTime(0.05 + s * 0.18, t, 0.06);
    engine.gain1.gain.setTargetAtTime(0.22 + s * 0.28, t, 0.06);
    engine.gain2.gain.setTargetAtTime(0.08 + s * 0.14, t, 0.06);
  }

  function updateSpeedoUI() {
    var kmh = Math.round(speed * MAX_KMH);
    if (speedoValueEl) speedoValueEl.textContent = String(kmh);
    if (speedoBarEl) speedoBarEl.style.width = (speed * 100).toFixed(1) + '%';
  }

  function meshLabel(child) {
    var parts = [(child.name || '').toLowerCase()];
    var mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(function (mat) {
      if (mat && mat.name) parts.push(mat.name.toLowerCase());
    });
    return parts.join(' ');
  }

  function makeGlowTexture(innerColor, midColor, outerColor) {
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, innerColor);
    g.addColorStop(0.45, midColor || 'rgba(160, 175, 200, 0.2)');
    g.addColorStop(1, outerColor || 'rgba(100, 110, 130, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeFloorShadowTexture() {
    return makeGlowTexture(
      'rgba(200, 210, 225, 0.28)',
      'rgba(140, 150, 170, 0.12)',
      'rgba(80, 90, 110, 0)'
    );
  }

  function createContactDisc() {
    var tex = makeFloorShadowTexture();
    var mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.38,
      blending: THREE.NormalBlending
    });
    contactDisc = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 2.6), mat);
    contactDisc.rotation.x = -Math.PI / 2;
    contactDisc.position.set(carOffsetX, modelBaseY - 0.06, 0.05);
    contactDisc.renderOrder = -1;
    scene.add(contactDisc);
  }

  function isHeadlightMesh(child) {
    var label = meshLabel(child);
    if (HEADLIGHT_EXCLUDE.test(label)) return false;
    return HEADLIGHT_PATTERN.test(label);
  }

  function applyHeadlightEmissive(object) {
    object.traverse(function (child) {
      if (!child.isMesh || !isHeadlightMesh(child)) return;
      var mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(function (mat) {
        if (!mat) return;
        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
          mat.emissive = new THREE.Color(HEADLIGHT_EMISSIVE);
          mat.emissiveIntensity = HEADLIGHT_INTENSITY;
          mat.toneMapped = false;
        }
      });
    });
  }

  function isTireMaterial(mat) {
    return !!(mat && mat.name && TIRE_MATERIAL_PATTERN.test(mat.name));
  }

  function meshUsesMaterial(mesh, matSet) {
    var mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (var i = 0; i < mats.length; i++) {
      if (mats[i] && matSet.has(mats[i])) return true;
    }
    return false;
  }

  function inWheelCylinder(x, y, z, hub, radius, band) {
    return Math.abs(x - hub.x) < band &&
      Math.hypot(y - hub.y, z - hub.z) < radius;
  }

  function findWheelIndex(x, y, z, hubs, radius, band) {
    for (var w = 0; w < hubs.length; w++) {
      if (inWheelCylinder(x, y, z, hubs[w], radius, band)) return w;
    }
    return -1;
  }

  function mergeNearbyBoxes(boxes) {
    var merged = [];
    var c = new THREE.Vector3();
    var mc = new THREE.Vector3();
    boxes.forEach(function (box) {
      box.getCenter(c);
      var found = false;
      for (var i = 0; i < merged.length; i++) {
        merged[i].getCenter(mc);
        if (c.distanceTo(mc) < WHEEL_HUB_MERGE_DIST) {
          merged[i].union(box);
          found = true;
          break;
        }
      }
      if (!found) merged.push(box.clone());
    });
    return merged;
  }

  function anchorWheelHubs(object) {
    var boxes = [];
    object.updateWorldMatrix(true, true);

    object.traverse(function (child) {
      if (!child.isMesh || !child.geometry) return;
      var mats = Array.isArray(child.material) ? child.material : [child.material];
      if (!mats.some(isTireMaterial)) return;

      _relMatrix.copy(object.matrixWorld).invert().multiply(child.matrixWorld);

      var posAttr = child.geometry.attributes.position;
      if (!posAttr) return;

      var fullBox = new THREE.Box3();
      for (var i = 0; i < posAttr.count; i++) {
        _vLocal.fromBufferAttribute(posAttr, i).applyMatrix4(_relMatrix);
        fullBox.expandByPoint(_vLocal);
      }
      var tireWidth = fullBox.max.x - fullBox.min.x;

      if (tireWidth < WHEEL_SINGLE_MESH_MAX_X) {
        boxes.push(fullBox);
        return;
      }

      var midX = (fullBox.min.x + fullBox.max.x) * 0.5;
      var geom = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry;
      var pos = geom.attributes.position;
      var sideBoxes = [new THREE.Box3(), new THREE.Box3()];
      var triCount = pos.count / 3;

      for (var t = 0; t < triCount; t++) {
        var cx = 0;
        for (var v = 0; v < 3; v++) {
          _vLocal.fromBufferAttribute(pos, t * 3 + v).applyMatrix4(_relMatrix);
          cx += _vLocal.x;
        }
        cx /= 3;
        var side = cx < midX ? 0 : 1;

        for (v = 0; v < 3; v++) {
          _vLocal.fromBufferAttribute(pos, t * 3 + v).applyMatrix4(_relMatrix);
          if (side === 0 && _vLocal.x >= midX) continue;
          if (side === 1 && _vLocal.x < midX) continue;
          sideBoxes[side].expandByPoint(_vLocal);
        }
      }

      if (geom !== child.geometry) geom.dispose();

      sideBoxes.forEach(function (b) {
        if (!b.isEmpty()) boxes.push(b);
      });
    });

    var merged = mergeNearbyBoxes(boxes);
    if (merged.length < 4) return null;
    if (merged.length > 4) merged = merged.slice(0, 4);

    var wheelDiameter = 0;
    var wheelWidth = 0;
    var size = new THREE.Vector3();
    var hubs = merged.map(function (b) {
      b.getSize(size);
      wheelDiameter = Math.max(wheelDiameter, Math.max(size.y, size.z));
      wheelWidth = Math.max(wheelWidth, size.x);
      return b.getCenter(new THREE.Vector3());
    });

    if (!wheelDiameter) wheelDiameter = 0.64;
    if (!wheelWidth) wheelWidth = wheelDiameter * 0.47;
    var radius = wheelDiameter * 0.5 * WHEEL_CYLINDER_SCALE;
    var band = wheelWidth * 0.5 * WHEEL_CYLINDER_SCALE;

    return { hubs: hubs, radius: radius, band: band };
  }

  function collectSpinMaterials(object) {
    var set = new Set();
    object.traverse(function (child) {
      if (!child.isMesh) return;
      var mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(function (mat) {
        if (mat && mat.name && SPIN_MATERIAL_PATTERN.test(mat.name)) set.add(mat);
      });
    });
    return set;
  }

  function createAttrBuckets(attrNames, attrMeta) {
    var buckets = {};
    attrNames.forEach(function (name) {
      buckets[name] = [];
      attrMeta[name] = {
        itemSize: attrMeta[name].itemSize,
        normalized: attrMeta[name].normalized
      };
    });
    return buckets;
  }

  function pushTriangle(buckets, geom, triIndex) {
    var attrNames = Object.keys(buckets);
    attrNames.forEach(function (name) {
      var src = geom.attributes[name];
      if (!src) return;
      var itemSize = src.itemSize;
      var base = triIndex * 3;
      for (var v = 0; v < 3; v++) {
        var vi = base + v;
        for (var k = 0; k < itemSize; k++) {
          buckets[name].push(src.array[vi * itemSize + k]);
        }
      }
    });
  }

  function buildBufferGeometry(buckets, attrMeta) {
    var geom = new THREE.BufferGeometry();
    var hasData = false;
    Object.keys(buckets).forEach(function (name) {
      var data = buckets[name];
      if (!data.length) return;
      var meta = attrMeta[name];
      var attr = new THREE.BufferAttribute(new Float32Array(data), meta.itemSize, meta.normalized);
      geom.setAttribute(name, attr);
      hasData = true;
    });
    return hasData ? geom : null;
  }

  function splitMeshByWheels(mesh, object, hubs, radius, band, wheelMatSet, pivots) {
    if (!meshUsesMaterial(mesh, wheelMatSet)) return;

    var srcGeom = mesh.geometry;
    var workGeom = srcGeom.index ? srcGeom.toNonIndexed() : srcGeom;
    var attrNames = Object.keys(workGeom.attributes);
    var attrMeta = {};
    attrNames.forEach(function (name) {
      var src = workGeom.attributes[name];
      attrMeta[name] = { itemSize: src.itemSize, normalized: src.normalized };
    });

    var wheelBuckets = hubs.map(function () {
      return createAttrBuckets(attrNames, attrMeta);
    });
    var restBuckets = createAttrBuckets(attrNames, attrMeta);

    _relMatrix.copy(object.matrixWorld).invert().multiply(mesh.matrixWorld);
    var pos = workGeom.attributes.position;
    var triCount = pos.count / 3;

    for (var t = 0; t < triCount; t++) {
      var cx = 0;
      var cy = 0;
      var cz = 0;
      for (var v = 0; v < 3; v++) {
        _vLocal.fromBufferAttribute(pos, t * 3 + v);
        _vLocal.applyMatrix4(_relMatrix);
        cx += _vLocal.x;
        cy += _vLocal.y;
        cz += _vLocal.z;
      }
      cx /= 3;
      cy /= 3;
      cz /= 3;

      var wi = findWheelIndex(cx, cy, cz, hubs, radius, band);
      if (wi >= 0) {
        pushTriangle(wheelBuckets[wi], workGeom, t);
      } else {
        pushTriangle(restBuckets, workGeom, t);
      }
    }

    if (workGeom !== srcGeom) workGeom.dispose();

    var mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    var mat = mats[0];

    hubs.forEach(function (hub, w) {
      var wheelGeom = buildBufferGeometry(wheelBuckets[w], attrMeta);
      if (!wheelGeom) return;

      var subMesh = new THREE.Mesh(wheelGeom, mat);
      subMesh.castShadow = mesh.castShadow;
      subMesh.receiveShadow = mesh.receiveShadow;
      subMesh.position.copy(mesh.position);
      subMesh.rotation.copy(mesh.rotation);
      subMesh.scale.copy(mesh.scale);
      mesh.parent.add(subMesh);
      pivots[w].attach(subMesh);
    });

    var restGeom = buildBufferGeometry(restBuckets, attrMeta);
    if (restGeom) {
      mesh.geometry.dispose();
      mesh.geometry = restGeom;
    } else {
      mesh.visible = false;
    }
  }

  function setupWheelSpin(object) {
    wheelPivots = [];
    var anchor = anchorWheelHubs(object);
    if (!anchor) return;

    var hubs = anchor.hubs;
    var radius = anchor.radius;
    var band = anchor.band;
    var wheelMatSet = collectSpinMaterials(object);
    if (!wheelMatSet.size) return;

    var pivots = hubs.map(function (hub) {
      var pivot = new THREE.Group();
      pivot.position.copy(hub);
      object.add(pivot);
      wheelPivots.push({ pivot: pivot });
      return pivot;
    });

    var meshes = [];
    object.traverse(function (child) {
      if (child.isMesh && meshUsesMaterial(child, wheelMatSet)) {
        meshes.push(child);
      }
    });

    meshes.forEach(function (mesh) {
      splitMeshByWheels(mesh, object, hubs, radius, band, wheelMatSet, pivots);
    });
  }

  function getStageSize() {
    var rect = stage.getBoundingClientRect();
    return {
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height))
    };
  }

  function updateCarLayout() {
    var w = getStageSize().width;
    var narrow = w < MOBILE_BREAKPOINT;

    if (narrow) {
      carOffsetX = 0;
      cameraBase.z = CAMERA_Z_MOBILE;
      cameraBase.y = 0.35;
      camera.fov = CAMERA_FOV_MOBILE;
      if (carModel) {
        carModel.scale.setScalar(modelFitScale * MODEL_SCALE_MOBILE);
      }
    } else if (w < 1024) {
      carOffsetX = CAR_OFFSET_X_TABLET;
      cameraBase.z = CAMERA_Z_WIDE;
      cameraBase.y = 0.55;
      camera.fov = CAMERA_FOV_DEFAULT;
      if (carModel) {
        carModel.scale.setScalar(modelFitScale);
      }
    } else {
      carOffsetX = CAR_OFFSET_X_WIDE;
      cameraBase.z = CAMERA_Z_WIDE;
      cameraBase.y = 0.55;
      camera.fov = CAMERA_FOV_DEFAULT;
      if (carModel) {
        carModel.scale.setScalar(modelFitScale);
      }
    }
    applyCarPosition();
  }

  function applyCamera() {
    camCurrentX = lerp(camCurrentX, camTargetX, CAM_LERP);
    camCurrentY = lerp(camCurrentY, camTargetY, CAM_LERP);

    camera.position.x = cameraBase.x + camCurrentX;
    camera.position.y = cameraBase.y + camCurrentY;
    camera.position.z = cameraBase.z;

    lookAtTarget.set(carOffsetX + driveOffsetX + exitOffsetX, modelBaseY + 0.2, 0);
    camera.lookAt(lookAtTarget);
  }

  function onPointerMove(e) {
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    var nx = (e.clientX / w) * 2 - 1;
    var ny = (e.clientY / h) * 2 - 1;
    camTargetX = nx * CAM_PARALLAX_X;
    camTargetY = -ny * CAM_PARALLAX_Y;
    carTiltYawTarget = nx * CAR_YAW_FROM_CURSOR;
    carTiltPitchTarget = -ny * CAR_PITCH_FROM_CURSOR;
  }

  function onPointerLeave() {
    camTargetX = 0;
    camTargetY = 0;
    carTiltYawTarget = 0;
    carTiltPitchTarget = 0;
  }

  function clearDriveButtons() {
    leftDown = false;
    rightDown = false;
  }

  function onHeroPointerDown(e) {
    if (isInteractiveTarget(e.target)) return;
    initEngineAudio();
    resumeEngineAudio();
    if (e.button === 0) leftDown = true;
    if (e.button === 2) rightDown = true;
  }

  function onHeroPointerUp(e) {
    if (e.button === 0) leftDown = false;
    if (e.button === 2) rightDown = false;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('pointerup', onHeroPointerUp, { passive: true });
  window.addEventListener('blur', clearDriveButtons);

  hero.addEventListener('pointerdown', onHeroPointerDown);
  hero.addEventListener('pointerup', onHeroPointerUp);
  hero.addEventListener('pointerleave', clearDriveButtons);
  hero.addEventListener('contextmenu', function (e) {
    if (!isInteractiveTarget(e.target)) e.preventDefault();
  });

  function fitModel(object) {
    var box = new THREE.Box3().setFromObject(object);
    var center = box.getCenter(new THREE.Vector3());
    var size = box.getSize(new THREE.Vector3());
    object.position.sub(center);
    var maxDim = Math.max(size.x, size.y, size.z);
    var scale = MODEL_TARGET_SIZE / maxDim;
    modelFitScale = scale;
    object.scale.setScalar(scale);
    modelBaseY = object.position.y - size.y * scale * 0.08 + MODEL_Y_OFFSET;
    object.position.y = modelBaseY;
    object.rotation.set(0, 0, 0);
    resize();
  }

  function resize() {
    var size = getStageSize();
    var w = size.width;
    var h = size.height;
    if (w < 1 || h < 1) return;

    var pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    camera.aspect = w / h;
    updateCarLayout();
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, true);
    composer.setSize(w, h);
    bloomPass.resolution.set(w, h);
  }

  function scheduleResize() {
    requestAnimationFrame(function () {
      requestAnimationFrame(resize);
    });
  }

  var resizeObs = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(scheduleResize)
    : null;
  if (resizeObs) {
    resizeObs.observe(stage);
    resizeObs.observe(hero);
  }
  window.addEventListener('resize', scheduleResize, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleResize, { passive: true });
  }
  window.addEventListener('load', scheduleResize, { passive: true });
  scheduleResize();

  if (typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function (entries) {
      isVisible = entries.some(function (entry) { return entry.isIntersecting; });
      if (isVisible && isLoaded) {
        startLoop();
        resumeEngineAudio();
      } else {
        stopLoop();
        suspendEngineAudio();
      }
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopLoop();
      suspendEngineAudio();
      clearDriveButtons();
    } else if (isVisible && isLoaded) {
      startLoop();
    }
  });

  function stopLoop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = 0;
    }
  }

  function startLoop() {
    if (animId || !isLoaded) return;
    lastFrame = performance.now();
    animId = requestAnimationFrame(tick);
  }

  function tick(now) {
    animId = requestAnimationFrame(tick);

    var dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0.016;
    lastFrame = now;

    idlePhase += IDLE_FLOAT_SPEED * dt;

    if (leftDown && !rightDown) {
      speed += ACCEL * dt;
    } else if (rightDown && !leftDown) {
      speed -= BRAKE * dt;
    } else {
      speed -= FRICTION * dt;
    }
    speed = Math.max(0, Math.min(1, speed));

    if (introActive) {
      var introDur = (stage.clientWidth || window.innerWidth) < MOBILE_BREAKPOINT
        ? INTRO_DURATION_MOBILE
        : INTRO_DURATION;
      var elapsed = (now - introStart) / 1000;
      var introT = Math.min(elapsed / introDur, 1);
      var introEase = 1 - Math.pow(1 - introT, 3);
      driveOffsetX = lerp(-ENTER_DISTANCE, 0, introEase);
      if (introT >= 1) {
        introActive = false;
        driveOffsetX = 0;
      }
    }

    carTiltYaw = lerp(carTiltYaw, carTiltYawTarget, CAR_TILT_LERP);
    carTiltPitch = lerp(carTiltPitch, carTiltPitchTarget, CAR_TILT_LERP);
    applyCarRotation();
    applyCarPosition();

    applyCamera();

    if (carModel) {
      var idleBlend = 1 - Math.min(1, speed / IDLE_FLOAT_FADE_END);
      var floatY = Math.sin(idlePhase * 1.2) * IDLE_FLOAT_AMP * idleBlend;
      carModel.position.y = modelBaseY + floatY;
    }

    var pulse = Math.sin(idlePhase * 1.1) * 0.5 + 0.5;
    rimLight.intensity = RIM_BASE + pulse * 0.08 + speed * 0.22;

    if (contactDisc) {
      contactDisc.position.y = modelBaseY - 0.06;
      contactDisc.material.opacity = 0.3 + pulse * 0.05 + speed * 0.14;
    }

    var motionOffsetX = driveOffsetX + exitOffsetX;
    var motionVelX = dt > 0.0001 ? (motionOffsetX - prevMotionOffsetX) / dt : 0;
    prevMotionOffsetX = motionOffsetX;

    var targetWheelSpeed = WHEEL_SPIN_MIN + speed * (WHEEL_SPIN_MAX - WHEEL_SPIN_MIN);
    wheelSpinSpeed = lerp(wheelSpinSpeed, targetWheelSpeed, WHEEL_SPEED_LERP);
    var interactiveRoll = wheelSpinSpeed * dt;
    var motionRoll = motionVelX * ROLL_PER_UNIT * dt;
    wheelPivots.forEach(function (entry) {
      entry.pivot.rotation.x += motionRoll + interactiveRoll;
    });

    updateSpeedoUI();
    updateEngineAudio(speed);

    composer.render();
  }

  var dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_PATH);

  var gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  function startIntro() {
    if (introPlayed || !isLoaded) return;
    introPlayed = true;
    introStart = performance.now();
    introActive = true;
  }

  function onModelLoaded(gltf) {
    carModel = gltf.scene;
    carModel.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        if (child.material) {
          var mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(function (mat) {
            if (mat && mat.isMeshStandardMaterial) {
              mat.envMapIntensity = 0.6;
            }
          });
        }
      }
    });
    fitModel(carModel);
    carGroup.add(carModel);

    setupWheelSpin(carModel);
    applyHeadlightEmissive(carModel);
    createContactDisc();
    scheduleResize();

    driveOffsetX = -ENTER_DISTANCE;
    prevMotionOffsetX = -ENTER_DISTANCE;
    applyCarPosition();

    isLoaded = true;
    window.AutoLuxeHero3D.active = true;
    stage.classList.add('is-ready');
    updateSpeedoUI();
    preloadSetProgress(1);
    preloadBump();
    document.dispatchEvent(new CustomEvent('autoluxe:hero3d-ready'));
    scheduleResize();
    if (isVisible) startLoop();

    setTimeout(function () {
      if (!introPlayed) startIntro();
    }, 1500);
  }

  function onModelError() {
    preloadSetProgress(1);
    preloadBump();
    document.documentElement.classList.remove('hero-3d-active');
    document.dispatchEvent(new CustomEvent('autoluxe:hero3d-failed'));
    var speedo = document.getElementById('heroSpeedo');
    if (speedo) speedo.remove();
    stage.remove();
  }

  gltfLoader.load(MODEL_URL, onModelLoaded, onLoadProgress, onModelError);
})();
