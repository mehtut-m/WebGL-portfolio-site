import * as THREE from 'three';
import ASScroll from '@ashthornton/asscroll';
import dat from 'dat.gui';
import gsap from 'gsap';
import barba from '@barba/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import testTexture from '../img/texture.jpg';

export default class Sketch {
  constructor(options) {
    this.container = options.domElement;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera = new THREE.PerspectiveCamera(
      30,
      this.width / this.height,
      10,
      1000
    );

    this.camera.position.z = 600;
    this.camera.fov = (2 * Math.atan(this.height / 2 / 600) * 180) / Math.PI;
    this.imagesAdded = 0;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(2);
    this.renderer.setSize(this.width, this.height);

    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.materials = [];

    this.asscroll = new ASScroll({
      disableRaf: true,
    });
    this.asscroll.enable({
      horizontalScroll: true,
    });

    this.time = 0;

    // this.setupSettings();

    this.addObjects();
    this.resize();
    this.render();

    this.barba();

    this.setUpResize();
  }

  barba() {
    barba.init({
      //...
    });
  }

  setupSettings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.001);
  }

  addObjects() {
    // (0.5, 0.5, 10, 1)10 triangle in horizontal scale and 1 in vertical
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);

    this.material = new THREE.ShaderMaterial({
      //   wireframe: true,
      uniforms: {
        time: { value: 1.0 },
        uProgress: { value: 0 },
        // uTexture: { value: new THREE.TextureLoader().load(testTexture) },
        uTexture: { value: null },
        uTextureSize: { value: new THREE.Vector2(100, 100) },
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uQuadSize: { value: new THREE.Vector2(300, 300) },
      },

      vertexShader: vertex,
      fragmentShader: fragment,
    });

    // Instantiate Timeline
    this.tl = gsap
      .timeline()
      .to(this.material.uniforms.uCorners.value, { x: 0, duration: 1 })
      .to(this.material.uniforms.uCorners.value, { y: 0, duration: 1 }, 0.1)
      .to(this.material.uniforms.uCorners.value, { z: 0, duration: 1 }, 0.2)
      .to(this.material.uniforms.uCorners.value, { w: 0, duration: 1 }, 0.3);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(300, 300, 1);
    // this.scene.add(this.mesh);
    this.mesh.position.x = 300;

    this.images = [...document.querySelectorAll('.js-image')];

    this.imageStore = this.images.map((img) => {
      let bounds = img.getBoundingClientRect(); // bound return info of object size and position
      let material = this.material.clone();
      this.materials.push(material);

      let texture = new THREE.TextureLoader().load(img.src);
      // texture.needsUpdate = true;

      material.uniforms.uTexture.value = texture;

      img.addEventListener('mouseover', () => {
        this.tl = gsap
          .timeline()
          .to(material.uniforms.uCorners.value, { x: 1, duration: 0.4 })
          .to(material.uniforms.uCorners.value, { y: 1, duration: 0.4 }, 0.1)
          .to(material.uniforms.uCorners.value, { z: 1, duration: 0.4 }, 0.2)
          .to(material.uniforms.uCorners.value, { w: 1, duration: 0.4 }, 0.3);
      });

      img.addEventListener('mouseout', () => {
        this.tl = gsap
          .timeline()
          .to(material.uniforms.uCorners.value, { x: 0, duration: 0.4 })
          .to(material.uniforms.uCorners.value, { y: 0, duration: 0.4 }, 0.1)
          .to(material.uniforms.uCorners.value, { z: 0, duration: 0.4 }, 0.2)
          .to(material.uniforms.uCorners.value, { w: 0, duration: 0.4 }, 0.3);
      });

      let mesh = new THREE.Mesh(this.geometry, material);
      this.scene.add(mesh);
      mesh.scale.set(bounds.width, bounds.height, 1);

      return {
        img,
        mesh,
        height: bounds.height,
        width: bounds.width,
        top: bounds.top,
        left: bounds.left,
      };
    });
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    // Field of Vision Calculated from size of the screen
    this.camera.fov = (2 * Math.atan(this.height / 2 / 600) * 180) / Math.PI;

    this.materials.forEach((material) => {
      material.uniforms.uResolution.value.x = this.width;
      material.uniforms.uResolution.value.y = this.height;
    });

    this.imageStore.forEach((item) => {
      let { width, height, top, left } = item.img.getBoundingClientRect();
      item.mesh.scale.set(width, height, 1);
      item.top = top;
      item.left = left + this.asscroll.currentPos;
      item.width = width;
      item.height = height;

      item.mesh.material.uniforms.uQuadSize.value.x = width;
      item.mesh.material.uniforms.uQuadSize.value.y = height;

      item.mesh.material.uniforms.uTextureSize.value.x = width;
      item.mesh.material.uniforms.uTextureSize.value.y = height;
    });
  }

  setUpResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }
  setPosition() {
    this.imageStore.forEach((obj) => {
      // Set the position of mesh to match the image
      obj.mesh.position.x =
        -this.asscroll.currentPos + obj.left - this.width / 2 + obj.width / 2;
      obj.mesh.position.y = -obj.top + this.height / 2 - obj.height / 2;
    });
  }

  render() {
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    // this.material.uniforms.uProgress.value = this.settings.progress;

    this.asscroll.update();
    this.setPosition();

    // Set Timeline Progression
    // this.tl.progress(this.settings.progress);

    // this.mesh.rotation.x = this.time / 2000;
    // this.mesh.rotation.y = this.time / 1000;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({ domElement: document.getElementById('container') });
