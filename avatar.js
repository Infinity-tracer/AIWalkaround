/**
 * avatar.js
 * Loads an FBX avatar into an overlay canvas and provides
 * startAvatarTalking() / stopAvatarTalking() to sync with TTS.
 *
 * Place this file at: app-files/avatar.js
 * FBX path expected: app-files/models/avatar.fbx
 * three.min.js and FBXLoader.js must be loaded before this file.
 */

(function () {
  // Config
  const CONTAINER_ID = "avatarContainer";
  const MODEL_PATH = "models/avatar.fbx"; // put your file here
  const WIDTH = 260;
  const HEIGHT = 360;
  const SCALE = 0.1; // tweak this to fit model size

  // Three.js essentials
  let scene3D, camera, renderer, clock, mixer, avatar;
  let canvasEl, containerEl;
  let idleAction = null, talkAction = null;
  let mouthInterval = null;
  let isTalking = false;

  function initScene() {
    containerEl = document.getElementById(CONTAINER_ID);
    if (!containerEl) {
      console.warn("avatar.js: container not found:", CONTAINER_ID);
      return;
    }

    // create renderer with alpha so it overlays nicely
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none"; // allow clicks through overlay
    containerEl.appendChild(renderer.domElement);
    canvasEl = renderer.domElement;

    // scene & camera
    scene3D = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, WIDTH / HEIGHT, 0.1, 2000);
    camera.position.set(0, 120, 350);

    // light
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemi.position.set(0, 200, 0);
    scene3D.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(0, 200, 100);
    scene3D.add(dir);

    clock = new THREE.Clock();

    // responsive (keeps same canvas size)
    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    // we keep fixed size here; adjust if you want responsive scaling
  }

  function loadFBX() {
    if (typeof THREE === "undefined" || typeof THREE.FBXLoader === "undefined") {
      console.error("avatar.js: THREE or FBXLoader missing. Check vendor scripts.");
      return;
    }

    const loader = new THREE.FBXLoader();
    loader.load(MODEL_PATH, function (object) {
      avatar = object;

      // Apply simple traverse fix: enable shadows, material tweaks
      avatar.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // optional: child.material.side = THREE.DoubleSide;
        }
      });

      // scale and rotation adjustments (tweak as needed)
      avatar.scale.set(SCALE, SCALE, SCALE);
      avatar.rotation.y = Math.PI; // rotate to face camera

      scene3D.add(avatar);

      // setup animations if present
      if (object.animations && object.animations.length > 0) {
        mixer = new THREE.AnimationMixer(avatar);

        // Heuristic: find named clips for "idle" and "talk"
        let idleClip = null, talkClip = null;
        object.animations.forEach(clip => {
          const name = clip.name.toLowerCase();
          if (!idleClip && (name.includes("idle") || name.includes("stand"))) idleClip = clip;
          if (!talkClip && (name.includes("talk") || name.includes("speak") || name.includes("speech"))) talkClip = clip;
        });

        // fallback: first clip as idle, second as talk
        if (!idleClip) idleClip = object.animations[0];
        if (!talkClip && object.animations.length > 1) talkClip = object.animations[1];

        if (idleClip) {
          idleAction = mixer.clipAction(idleClip);
          idleAction.play();
        }
        if (talkClip) {
          talkAction = mixer.clipAction(talkClip);
          talkAction.loop = THREE.LoopRepeat;
        }
      } else {
        console.info("avatar.js: no animations found in FBX — using procedural fallback.");
      }
    }, function (xhr) {
      // progress
    }, function (err) {
      console.error("avatar.js: FBX load error", err);
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock ? clock.getDelta() : 0;
    if (mixer) mixer.update(dt);
    // subtle idle rotation if no mixer
    if (!mixer && avatar) {
      avatar.rotation.y += 0.001;
    }
    renderer.render(scene3D, camera);
  }

  // --- Talking control ---

  // Start talking: prefer play talkAction, else procedural mouth move
  function startAvatarTalking() {
    if (!avatar) return;
    if (isTalking) return;
    isTalking = true;

    if (mixer && talkAction) {
      // crossfade from idle to talk
      if (idleAction) {
        idleAction.fadeOut(0.2);
      }
      talkAction.reset();
      talkAction.play();
    } else {
      // procedural mouth / head movement fallback
      let direction = 1;
      mouthInterval = setInterval(() => {
        if (!avatar) return;
        // Try rotating a jaw bone if exists
        const jaw = findBoneByName(avatar, [/jaw/i, /mouth/i]);
        if (jaw) {
          jaw.rotation.x = 0.03 * Math.sin(Date.now() / 60);
        } else {
          // fallback: small scale or rotation to simulate talk
          avatar.rotation.x = 0.02 * Math.sin(Date.now() / 80);
        }
      }, 60);
    }
  }

  // Stop talking: return to idle action or stop interval
  function stopAvatarTalking() {
    if (!avatar) return;
    if (!isTalking) return;
    isTalking = false;

    if (mixer && talkAction) {
      // fade out talk, fade in idle
      talkAction.fadeOut(0.15);
      if (idleAction) {
        idleAction.reset();
        idleAction.fadeIn(0.2).play();
      }
    } else {
      if (mouthInterval) {
        clearInterval(mouthInterval);
        mouthInterval = null;
      }
      // reset rotations
      avatar.rotation.x = 0;
      // try resetting jaw bone rotation too
      const jaw = findBoneByName(avatar, [/jaw/i, /mouth/i]);
      if (jaw) jaw.rotation.x = 0;
    }
  }

  // Helper: search recursively for bone by a list of regex patterns
  function findBoneByName(obj, regexList) {
    let found = null;
    obj.traverse(child => {
      if (found) return;
      if (child && child.name) {
        const name = child.name;
        for (let r of regexList) {
          if (r.test(name)) {
            found = child;
            break;
          }
        }
      }
    });
    return found;
  }

  // Expose global helpers so voice.js can call them
  window.startAvatarTalking = startAvatarTalking;
  window.stopAvatarTalking = stopAvatarTalking;

  // Initialize
  try {
    initScene();
    loadFBX();
    animate();
  } catch (e) {
    console.error("avatar.js init error", e);
  }
})();
